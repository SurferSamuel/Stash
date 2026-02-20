import dayjs from 'dayjs';

import { getData, getExchangeRateData, getHistoricalData } from '@storage';
import { dayjsParse } from '@utils';
import { writeLog } from '@logs';
import {
  Account,
  ChartDataPoint,
  ExchangeRate,
  ExchangeRateEntry,
  Historical,
  HistoricalEntry,
  PortfolioData,
  PortfolioFilterValues,
  Quote,
  Security,
  TradeRow,
} from '@types';

import { QuoteService } from '../quotes';

/**
 * Gets the data for the "Portfolio" page.
 *
 * @param values Filter values
 */
export const getPortfolioData = async (values: PortfolioFilterValues) => {
  const assembler = new PortfolioDataAssembler(values);
  return await assembler.assemble();
};

/**
 * Class responsible for assembling the `PortfolioData` object.
 */
class PortfolioDataAssembler {
  private quoteService = new QuoteService();
  private values: PortfolioFilterValues;
  private idGen: IdGenerator;
  private securities: Map<string, Security>;
  private accounts: Map<string, Account>;
  private historicals: Map<string, Historical>;
  private exchangeRates: Map<string, ExchangeRate>;
  private dataPoints: ChartDataPoint[] = [];
  private result: PortfolioData = {
    chart: [],
    holdings: [],
    trades: [],
    buyHistory: [],
    sellHistory: [],
    marketValue: 0,
    todayChange: 0,
    todayChangePerc: null,
    profitOrLoss: 0,
    profitOrLossPerc: null,
    currency: 'AUD',
  };

  constructor(values: PortfolioFilterValues) {
    this.values = values;
  }

  /**
   * Assembles the `PortfolioData` object.
   */
  public async assemble() {
    await this.performAssemble();
    return this.result;
  }

  private async performAssemble() {
    await this.quoteService.init();

    this.securities = new Map<string, Security>();
    for (const security of (await getData('securities')).values()) {
      // Only add security if it matches all filter values
      if (
        this.values.countries.every((value) => security.countries.some((country) => country.name === value))
        && this.values.financialStatus.every((value) => security.financialStatus.includes(value))
        && this.values.miningStatus.every((value) => security.miningStatus.includes(value))
        && this.values.resources.every((value) => security.resources.includes(value))
        && this.values.products.every((value) => security.products.includes(value))
        && this.values.recommendations.every((value) => security.recommendations.includes(value))
      ) {
        this.securities.set(security.symbol, security);
      }
    }

    if (this.securities.size === 0) return;

    this.accounts = await getData('accounts');
    this.idGen = new IdGenerator();

    const symbols = Array.from(this.securities.keys());

    // Fetch historical data for all securities
    try {
      this.historicals = await getHistoricalData(symbols);
    } catch (error) {
      writeLog(`[PortfolioDataAssembler.assemble()]: Could not continue as a yahooFinance.chart() failed: ${error.message}`);
      return;
    }

    const currencyCodes = new Set(this.historicals.values().map((historical) => historical.currency));
    const quoteDataRequest = this.quoteService.requestQuoteData(symbols, Array.from(currencyCodes));

    // Fetch exchange rate data for all required currencies
    try {
      this.exchangeRates = await getExchangeRateData(Array.from(currencyCodes));
    } catch (error) {
      writeLog(`[PortfolioDataAssembler.assemble()]: Could not continue as a yahooFinance.chart() failed: ${error.message}`);
      return;
    }

    this.initialiseDataPoints();

    // Process data points, trades and history while quoteDataRequest is pending
    for (const security of this.securities.values()) {
      const historical = this.historicals.get(security.symbol);
      if (historical === undefined || historical.entries.length === 0) {
        writeLog(`[PortfolioDataAssembler.assemble()]: Skipped ${security.symbol}. Missing/empty historical data.`);
        continue;
      }

      // Get exchange rate entries if currency needs converting
      let exchangeRateEntries: ExchangeRateEntry[] | undefined;
      if (historical.currency !== this.quoteService.getTargetCurrency()) {
        const exchangeRate = this.exchangeRates.get(historical.currency);
        if (exchangeRate === undefined || exchangeRate.entries.length === 0) {
          writeLog(`[PortfolioDataAssembler.assemble()]: Skipped ${security.symbol}. Missing/empty exchange rate data for ${historical.currency}.`);
          continue;
        }
        exchangeRateEntries = exchangeRate.entries;
      } else {
        exchangeRateEntries = undefined;
      }

      this.processDataPoints(security, historical.entries, exchangeRateEntries);
      this.processTradesAndHistory(security);
    }

    // Wait until quote request is fetched
    try {
      await quoteDataRequest;
    } catch (error) {
      writeLog(`[PortfolioDataAssembler.assemble()]: Could not continue as yahooFinance.quote() failed: ${error.message}`);
      return;
    }

    this.processHoldingAndDataPointsWithQuotes();
  }

  /**
   * Initialises 1 data point for each day, from 5 years ago to today.
   */
  private initialiseDataPoints() {
    let currentDate = dayjs().subtract(5, 'year');
    const today = dayjs();

    while (!currentDate.isAfter(today, 'day')) {
      this.dataPoints.push({
        time: currentDate.format('YYYY-MM-DD'),
        value: 0,
      });
      currentDate = currentDate.add(1, 'day');
    }
  }

  /**
   * Processes chart data points for the given security using historical and exchange rate data (if required).
   * The processed data points are added into to `this.dataPoints`.
   */
  private processDataPoints(security: Security, historicalEntries: HistoricalEntry[], exchangeRateEntries?: ExchangeRateEntry[]) {
    const unitTracker = new UnitTracker(security, this.values.accountId);
    const historicalIterator = new EntryIterator(historicalEntries);

    // If no exchange rate entries given, then use a conversion rate of 1 : 1.
    const exchangeRateIterator = exchangeRateEntries !== undefined
      ? new EntryIterator(exchangeRateEntries)
      : { getEntryAtTime: (_: string) => ({ rate: 1 }) };

    for (const dataPoint of this.dataPoints) {
      const units = unitTracker.getUnitsAtTime(dataPoint.time);
      const adjClose = historicalIterator.getEntryAtTime(dataPoint.time).adjClose;
      const rate = exchangeRateIterator.getEntryAtTime(dataPoint.time).rate;

      dataPoint.value += units * adjClose * rate;
    }
  }

  /**
   * Processes trades, buy history & sell history rows for the given security.
   * All rows are then added to `this.result`.
   */
  private processTradesAndHistory(security: Security) {
    const { symbol, currency, exchange } = security;

    const trades = new Map<string, TradeRow>();

    for (const entry of security.buyHistory) {
      // Ignore entries that don't match account id filter
      if (this.values.accountId !== '' && this.values.accountId !== entry.accountId) {
        continue;
      }

      const { accountId, ...entryFields } = entry;
      const accountName = this.accounts.get(accountId)?.name ?? '';

      this.result.buyHistory.push({
        ...entryFields,
        id: this.idGen.nextBuyHistoryId(),
        accountName,
        symbol,
        currency,
        exchange,
      });

      trades.set(entry.tradeId, {
        ...entryFields,
        id: this.idGen.nextTradeId(),
        type: 'BUY',
        accountName,
        symbol,
        currency,
        exchange,
      });
    }

    for (const entry of security.sellHistory) {
      // Ignore entries that don't match account id filter
      if (this.values.accountId !== '' && this.values.accountId !== entry.accountId) {
        continue;
      }

      const { accountId, ...entryFields } = entry;
      const accountName = this.accounts.get(accountId)?.name ?? '';

      this.result.sellHistory.push({
        ...entryFields,
        id: this.idGen.nextSellHistoryId(),
        accountName,
        symbol,
        currency,
        exchange,
      });

      const existingTrade = trades.get(entry.tradeId);
      if (existingTrade !== undefined) {
        existingTrade.quantity += entry.quantity;
        existingTrade.brokerage += entry.appliedSellBrokerage;
        existingTrade.gst += entry.appliedSellGst;
        existingTrade.total += entry.total;
      } else {
        trades.set(entry.tradeId, {
          id: this.idGen.nextTradeId(),
          tradeId: entry.tradeId,
          date: entry.sellDate,
          type: 'SELL',
          accountName,
          symbol,
          currency,
          exchange,
          quantity: entry.quantity,
          price: entry.sellPrice,
          brokerage: entry.appliedSellBrokerage,
          gst: entry.appliedSellGst,
          total: entry.total,
        });
      }
    }

    // Once all trades have been processed, attach them to this.result
    for (const trade of trades.values()) {
      this.result.trades.push(trade);
    }
  }

  /**
   * Processes the rest of the holding data and updates today's data point using quote data.
   * The holding data and data points are then added into `this.result`.
   */
  private processHoldingAndDataPointsWithQuotes() {
    let combinedValue = 0;
    let combinedPreviousValue = 0;
    let combinedCost = 0;

    for (const security of this.securities.values()) {
      // We can skip securities with no holdings (doesn't affect totals)
      if (security.holdings.length === 0) {
        continue;
      }

      let quote: Quote;
      let exchangeRate: number;
      let previousExchangeRate: number;
      try {
        ({ quote, exchangeRate, previousExchangeRate } = this.quoteService.getQuote(security.symbol));
      } catch (error) {
        writeLog(`[PortfolioDataAssembler.processHoldingAndDataPointsWithQuotes]: Skipping ${security.symbol}: ${error.message}`);
        continue;
      }

      // Safe deconstruction (fields checked inside .getQuote())
      const previousPrice = quote.regularMarketPreviousClose!;
      const lastPrice = quote.regularMarketPrice!;

      let marketValue = 0;
      let previousValue = 0;
      let units = 0;
      let cost = 0;
      let firstPurchase = '';
      let lastPurchase = '';

      for (const holding of security.holdings) {
        // Ignore holdings that don't match account id filter
        if (this.values.accountId !== '' && this.values.accountId !== holding.accountId) {
          continue;
        }

        const { quantity, price: buyPrice, brokerage, gst } = holding;

        marketValue += lastPrice * quantity;
        cost += buyPrice * quantity + brokerage + gst;
        units += quantity;

        // If the holding was owned before today, use previous (yesterday's) price, otherwise use the buy price
        previousValue += dayjsParse(holding.date).isBefore(dayjs(), 'day')
          ? previousPrice * quantity
          : buyPrice * quantity;

        if (firstPurchase === '' || dayjsParse(holding.date).isBefore(firstPurchase)) {
          firstPurchase = holding.date;
        }
        if (lastPurchase === '' || dayjsParse(holding.date).isAfter(lastPurchase)) {
          lastPurchase = holding.date;
        }
      }

      // Update combined totals
      combinedValue += marketValue * exchangeRate;
      combinedPreviousValue += previousValue * previousExchangeRate;
      combinedCost += cost * exchangeRate; // TODO USE RATE AT PURCHASE

      // Add the holding row
      if (units > 0) {
        const profitOrLoss = marketValue - cost;
        const profitOrLossPerc = cost !== 0 ? profitOrLoss / cost : null;
        const todayChange = marketValue - previousValue;
        const todayChangePerc = previousValue !== 0 ? todayChange / previousValue : null;

        this.result.holdings.push({
          id: this.idGen.nextHoldingId(),
          symbol: security.symbol,
          name: security.name,
          currency: security.currency,
          exchangeRate,
          exchange: security.exchange,
          type: security.type,
          units,
          buyPrice: cost / units,
          lastPrice,
          marketValue,
          purchaseCost: cost,
          profitOrLoss,
          profitOrLossPerc,
          todayChange,
          todayChangePerc,
          firstPurchase,
          lastPurchase,
          weightPerc: 0, // Calculated after all rows are done
        });
      }
    }

    // Calculate the weight of each row
    for (const row of this.result.holdings) {
      row.weightPerc = row.marketValue * row.exchangeRate / combinedValue;
    }

    const today = dayjs().format('YYYY-MM-DD');
    const lastDataPoint = this.dataPoints[this.dataPoints.length - 1];

    // Override the value for today's data point
    if (lastDataPoint.time === today) {
      lastDataPoint.value = combinedValue;
    } else {
      this.dataPoints.push({
        time: today,
        value: combinedValue,
      });
    }

    // Attach data points to the result object as a sorted array (ascending time order)
    this.result.chart = Array.from(this.dataPoints.values())
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    this.result.marketValue = combinedValue;
    this.result.todayChange = combinedValue - combinedPreviousValue;
    this.result.todayChangePerc = (combinedPreviousValue !== 0) ? this.result.todayChange / combinedPreviousValue : null;
    this.result.profitOrLoss = combinedValue - combinedCost;
    this.result.profitOrLossPerc = (combinedCost !== 0) ? this.result.profitOrLoss / combinedCost : null;
    this.result.currency = this.quoteService.getTargetCurrency();
  }
}

/**
 * A helper class for generating simple ids.
 */
class IdGenerator {
  holdingId = 1;
  tradeId = 1;
  buyHistoryId = 1;
  sellHistoryId = 1;

  public nextHoldingId() {
    return this.holdingId++;
  }

  public nextTradeId() {
    return this.tradeId++;
  }

  public nextBuyHistoryId() {
    return this.buyHistoryId++;
  }

  public nextSellHistoryId() {
    return this.sellHistoryId++;
  }
}

/**
 * A helper class that tracks the number of units held of a specific security, at a given time,
 * for a specific account.
 */
class UnitTracker {
  security: Security;      // Which security to track
  accountIdFilter: string; // Filter for a specific account? Empty string = no filter
  units = 0;               // How many units are currently held
  buyIndex = 0;            // Current index we are up to in the security's buy history
  sellIndex = 0;           // Current index we are up to in the security's sell history

  /**
   * Constructor for the `UnitTracker` helper class.
   *
   * @param security Which security to track
   * @param accountIdFilter Filter for a specific account? Use `accountIdFilter = ""` for no filtering.
   */
  constructor(security: Security, accountIdFilter: string) {
    this.security = security;
    this.accountIdFilter = accountIdFilter;
  }

  /**
   * Updates and returns the number of units held as of the given time.
   * The provided time must later than the previous time.
   *
   * @param time The next time
   */
  public getUnitsAtTime(time: string) {
    while (this.buyIndex < this.security.buyHistory.length) {
      const entry = this.security.buyHistory[this.buyIndex];

      if (!dayjsParse(entry.date).isBefore(time)) {
        break;
      }

      if (this.accountIdFilter === '' || this.accountIdFilter === entry.accountId) {
        this.units += Number(entry.quantity);
      }

      this.buyIndex++;
    }

    while (this.sellIndex < this.security.sellHistory.length) {
      const entry = this.security.sellHistory[this.sellIndex];

      if (!dayjsParse(entry.sellDate).isBefore(time)) {
        break;
      }

      if (this.accountIdFilter === '' || this.accountIdFilter === entry.accountId) {
        this.units -= Number(entry.quantity);
      }

      this.sellIndex++;
    }

    return this.units;
  }
}

/**
 * A helper class for iterating through an array of entries (which may contain missing
 * data due to weekends/public holidays).
 */
class EntryIterator<T extends { date: string }> {
  entries: T[];
  index = 0;

  /**
   * Constructor for the `EntryIterator` helper class.
   *
   * @param entries Array of entries (in date ascending order)
   */
  constructor(entries: T[]) {
    this.entries = entries;
  }

  /**
   * Updates and returns the latest entry as of the given time.
   * The provided time must later than the previous time.
   *
   * @param time The next time
   */
  public getEntryAtTime(time: string): T {
    // Move index to the latest entry before/equal to the given time
    while ((this.index + 1) < this.entries.length && dayjs(time).isAfter(this.entries[this.index + 1].date)) {
      this.index++;
    }
    return this.entries[this.index];
  }
}
