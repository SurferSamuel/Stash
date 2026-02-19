import { getData, setData } from '@storage';
import { Holding, Security } from '@types';
import { dayjsParse } from '@utils';

import { QuoteService } from '../quotes';

export interface TradeData {
  accountId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  date: string;
  quantity: number;
  price: number;
  brokerage: number;
}

/**
 * Gets the last price for the given symbol.
 *
 * @param symbol Symbol of the security
 * @returns The price as a number
 * @throws If `yahooFinance.quote()` failed or the price was not found
 */
export const lastPrice = async (symbol: string) => {
  const quoteService = new QuoteService();
  await quoteService.init();

  await quoteService.requestQuoteData([symbol], []);
  const { quote } = quoteService.getQuote(symbol);

  // Safe deconstruction (fields checked inside .getQuote())
  return quote.regularMarketPrice!;
};

/**
 * Returns the number of available units.
 *
 * @param symbol Symbol of the security
 * @param accountId Account id to check
 * @returns Number of available units
 * @throws If `symbol` does not exist
 */
export const availableUnits = async (symbol: string, accountId: string) => {
  const securities = await getData('securities');

  const security = securities.get(symbol);
  if (security === undefined) {
    throw new Error(`ERROR: Could not find data for ${symbol}.`);
  }

  return security.holdings
    .filter((entry) => entry.accountId === accountId)
    .reduce((acc, cur) => acc + Number(cur.quantity), 0);
};

/**
 * Adds a trade for a security into the application.
 *
 * @param data Data for the trade
 * @throws
 * - If `data.quantity` is zero
 * - If `data.symbol` does not exist
 * - If GST % can not be parsed from settings
 */
export const addTrade = async (data: TradeData) => {
  if (data.quantity === 0) {
    throw new Error('ERROR: Quantity is zero.');
  }

  const securities = await getData('securities');
  const settings = await getData('settings');

  const security = securities.get(data.symbol);
  if (security === undefined) {
    throw new Error(`ERROR: Could not find symbol ${data.symbol}.`);
  }

  const gstPercent = Number(settings.gstPercent);
  if (isNaN(gstPercent)) {
    throw new Error('ERROR: Could not parse GST % from settings, is NaN.');
  }

  // Perform the trade action (either buy/sell)
  const tradeAction = data.type === 'BUY' ? buyTrade : sellTrade;
  await tradeAction(data, security, gstPercent);

  await setData('securities', securities);
};

/**
 * Adds a trade for buying a security into the application.
 *
 * @param trade Data for the trade
 * @param security Object containing the security data
 * @param gstPercent GST % to use
 */
const buyTrade = async (trade: TradeData, security: Security, gstPercent: number) => {
  const { quantity, price, brokerage } = trade;
  const gst = brokerage * gstPercent / 100;
  const total = quantity * price + brokerage + gst;

  const newHolding: Holding = {
    accountId: trade.accountId,
    date: trade.date,
    quantity: trade.quantity,
    price: trade.price,
    brokerage: trade.brokerage,
    gst,
  };

  security.holdings.push(newHolding);
  security.buyHistory.push({
    tradeId: crypto.randomUUID(),
    total,
    ...newHolding,
  });

  // Ensure order is maintained
  security.buyHistory.sort((a, b) => dayjsParse(a.date).isAfter(dayjsParse(b.date)) ? 1 : -1);
};

/**
 * Adds a trade for selling a security into the application.
 *
 * @param trade Data for the trade
 * @param security Object containing the security data
 * @param gstPercent GST % to use
 */
const sellTrade = async (trade: TradeData, security: Security, gstPercent: number) => {
  // Retrieve all holdings for the account id, removing any holdings with buy dates
  // after the sell date, sorted in ascending date order (oldest first)
  const holdings = security.holdings
    .filter((holding) => holding.accountId === trade.accountId && !dayjsParse(holding.date).isAfter(dayjsParse(trade.date)))
    .sort((a, b) => (dayjsParse(a.date).isBefore(dayjsParse(b.date)) ? -1 : 1));

  // Check that the account id owns enough units for the trade
  const ownedUnits = holdings.reduce((acc, cur) => acc + Number(cur.quantity), 0);
  if (ownedUnits < trade.quantity) {
    throw new Error(`ERROR: Insufficient quantity. Required: ${trade.quantity}. Owned: ${ownedUnits}`);
  }

  const tradeId = crypto.randomUUID();
  const totalSellGst = trade.brokerage * gstPercent;

  // Keep looping until all quantity is accounted for
  let remainingQuantity = trade.quantity;
  while (remainingQuantity > 0) {
    // Retrieve next (oldest) holding
    const holding = holdings.shift()!;

    const quantitySold = Math.min(holding.quantity, remainingQuantity);
    remainingQuantity -= quantitySold;

    const buyRatio = quantitySold / holding.quantity;
    const sellRatio = quantitySold / trade.quantity;

    const appliedBuyBrokerage = buyRatio * holding.brokerage;
    const appliedSellBrokerage = sellRatio * trade.brokerage;
    const appliedBuyGst = buyRatio * holding.gst;
    const appliedSellGst = sellRatio * totalSellGst;

    const totalCost = quantitySold * holding.price + appliedBuyBrokerage + appliedBuyGst;
    const totalRevenue = quantitySold * trade.price - appliedSellBrokerage - appliedSellGst;
    const profitOrLoss = totalRevenue - totalCost;

    // Calculate the capital gain/loss
    // CGT discount (50%) applies if the owner has:
    //   1. Held onto the asset for more than 12 months, and
    //   2. Made a capital gain.
    const cgtDiscount = profitOrLoss > 0 && dayjsParse(trade.date).diff(dayjsParse(holding.date), 'year', true) > 1;
    const capitalGainOrLoss = cgtDiscount ? profitOrLoss / 2 : profitOrLoss;

    security.sellHistory.push({
      tradeId,
      accountId: trade.accountId,
      buyDate: holding.date,
      sellDate: trade.date,
      quantity: quantitySold,
      buyPrice: holding.price,
      sellPrice: trade.price,
      appliedBuyBrokerage,
      appliedSellBrokerage,
      appliedBuyGst,
      appliedSellGst,
      total: totalRevenue,
      profitOrLoss,
      capitalGainOrLoss,
      cgtDiscount,
    });

    // If the full quantity of the holding was sold, remove the holding from the security object.
    // Otherwise, remove only the amount sold from the holding.
    if (quantitySold === holding.quantity) {
      const index = security.holdings.indexOf(holding);
      if (index != -1) {
        security.holdings.splice(index, 1);
      }
    } else {
      holding.quantity -= quantitySold;
      holding.brokerage *= 1 - buyRatio;
      holding.gst *= 1 - buyRatio;
    }
  }

  // Ensure order is maintained
  security.sellHistory.sort((a, b) => dayjsParse(a.sellDate).isAfter(dayjsParse(b.sellDate)) ? 1 : -1);
};
