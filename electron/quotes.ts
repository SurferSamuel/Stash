import YahooFinance from 'yahoo-finance2';
import { getData } from '@storage';
import { writeLog } from '@logs';
import { Quote } from '@types';

const yahooFinance = new YahooFinance();
const quoteFields = ['regularMarketPrice', 'regularMarketPreviousClose', 'currency', 'exchange'];

/**
 * A helper class that handles fetching quote data.
 */
export class QuoteService {
  private quotes: Map<string, Quote>;
  private targetCurrency = 'AUD';

  public async init() {
    this.targetCurrency = (await getData('settings')).currency;
  }

  public getTargetCurrency() {
    return this.targetCurrency;
  }

  public setTargetCurrency(targetCurrency: string) {
    this.targetCurrency = targetCurrency;
  }

  /**
   * Requests quote data for the given security symbols and currency codes.
   * Use `.getQuote()` method to access the retrieved quote data.
   *
   * @param securitySymbols Array of security symbols, eg. `["NVDA", "CBA.AX"]`
   * @param currencyCodes Array of currency codes, eg. `["AUD", "USD"]`
   * @throws If the yahooFinance.quote() request fails
   */
  public async requestQuoteData(securitySymbols: string[], currencyCodes: string[]) {
    const symbols = new Set(securitySymbols);

    // Don't include the target currency in the currency codes
    // Conversion is simply 1 : 1, so no need to send quote()
    currencyCodes.forEach((currency) => {
      if (currency !== this.targetCurrency) {
        symbols.add(`${currency}${this.targetCurrency}=X`);
      }
    });

    const quoteMap = await yahooFinance.quote(Array.from(symbols), { fields: quoteFields, return: 'map' });

    // Log if any quotes were not fetched
    if (quoteMap.size !== symbols.size) {
      symbols.forEach((symbol) => {
        if (!quoteMap.has(symbol)) writeLog(`[QuoteService.fetchQuoteData()]: WARNING: Did not receive quote data for ${symbol}.`);
      });
    }

    this.quotes = quoteMap;
  };

  /**
   * Gets the quote and exchange rates for the symbol.
   *
   * @param symbol The symbol to fetch
   * @throws If the quote (or exchange rate quote) could not be found, or has missing fields
   * @returns The quote and its currency's exchange rates (current and previous day's)
   */
  public getQuote(symbol: string) {
    const quote = this.quotes.get(symbol);
    if (quote === undefined) {
      throw new Error('Could not find quote.');
    }

    // Check that all fields were received
    const missingFields = quoteFields.filter((field) => !Object.prototype.hasOwnProperty.call(quote, field));
    if (missingFields.length > 0) {
      throw new Error(`Quote is missing the following fields: ${missingFields.join(', ')}.`);
    }

    let exchangeRate = 1;
    let previousExchangeRate = 1;

    if (this.targetCurrency !== quote.currency!) {
      const exchangeQuote = this.quotes.get(`${quote.currency}${this.targetCurrency}=X`);
      if (exchangeQuote === undefined) {
        throw new Error('Could not find exchange rate quote.');
      }

      if (!('regularMarketPrice' in exchangeQuote)) {
        throw new Error(`Exchange quote does not contain 'regularMarketPrice': ${exchangeQuote}`);
      }

      if (!('regularMarketPreviousClose' in exchangeQuote)) {
        throw new Error(`Exchange quote does not contain 'regularMarketPreviousClose': ${exchangeQuote}`);
      }

      exchangeRate = exchangeQuote.regularMarketPrice!;
      previousExchangeRate = exchangeQuote.regularMarketPreviousClose!;
    }

    return { quote, exchangeRate, previousExchangeRate };
  }
}
