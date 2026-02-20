import storage from 'electron-json-storage';
import YahooFinance from 'yahoo-finance2';
import { app, shell } from 'electron';
import dayjs from 'dayjs';

import { writeLog } from '@logs';
import {
  Account,
  ExchangeRate,
  ExchangeRateEntry,
  Historical,
  HistoricalEntry,
  Security,
  Settings,
} from '@types';

export type Data = {
  financialStatus: string[];
  miningStatus: string[];
  monitor: string[];
  products: string[];
  recommendations: string[];
  resources: string[];
  accounts: Map<string, Account>; // K = accountId
  securities: Map<string, Security>; // K = symbol
  historicals: Map<string, Historical>; // K = symbol
  exchangeRates: Map<string, ExchangeRate>; // K = currency
  settings: Settings;
};

const yahooFinance = new YahooFinance();

let data: Data;

// Keys which use a map type. We need to treat these keys differently
// since we can't store maps directly to JSON.
const mapKeys = new Set<keyof Data>(['accounts', 'securities', 'historicals', 'exchangeRates']);

/**
 * Reloads the data from storage into the application.
 */
export const reloadData = async () => {
  // Reset data back to empty
  data = {
    financialStatus: [],
    miningStatus: [],
    monitor: [],
    products: [],
    recommendations: [],
    resources: [],
    accounts: new Map(),
    securities: new Map(),
    historicals: new Map(),
    exchangeRates: new Map(),
    settings: {
      currency: 'AUD',
      gstPercent: 10,
      brokerageAutoFill: 10,
    },
  };

  // Fill data with storage values
  Object.keys(data).forEach((key: keyof Data) => {
    const storageData = storage.getSync(key);
    // If data was found for this key
    if (Array.isArray(storageData) || Object.keys(storageData).length > 0) {
      // If this key should be a map, we need to convert it from an object to a map
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data[key] = mapKeys.has(key) ? new Map(Object.entries(storageData)) : storageData as any;
    }
  });
};

// Load data from storage into the application on startup
reloadData();

/**
 * Gets the data for a specific key.
 *
 * - Returns data by reference. Modifying the returned value will update the data across all files.
 * - You should call `saveData()` if you have made any changes.
 * - Use `structuredClone()` if you intend to modify the returned value without saving it.
 * - Use `getHistoricalData()` or `getExchangeRateData()` to get data for historicals or exchange rates.
 *
 * @param key Provided key
 * @returns The data saved for the key
 */
export const getData = async <K extends keyof Omit<Data, 'historicals' | 'exchangeRates'>>(key: K): Promise<Data[K]> => {
  return data[key];
};

/**
 * Sets the data for a specific key, and backups it up into storage.
 *
 * @param key Provided key
 * @param newData The new data for the key
 */
export const setData = async <K extends keyof Data>(key: K, newData: Data[K]) => {
  data[key] = newData;

  // We can't store maps directly to JSON, so convert it to a plain object
  const saveData = newData instanceof Map ? Object.fromEntries(newData) : newData;

  storage.set(key, saveData, (error) => {
    if (error) writeLog(`[setData]: ${error}`);
  });
};

/**
 * Gets the full path to the storage folder.
 * */
export const getStoragePath = async () => {
  return storage.getDataPath();
};

/**
 * Opens the storage folder in a new window.
 */
export const openStoragePath = async () => {
  shell.openPath(storage.getDataPath());
};

/**
 * Gets the version of the application.
 */
export const getVersion = async () => {
  return app.getVersion();
};

/**
 * Gets the historical data from storage, fetching new data if any symbols are outdated or missing from storage.
 *
 * - Returns data by reference. Modifying the returned value will update the data across all files.
 * - You should call `saveData()` if you have made any changes.
 * - Use `structuredClone()` if you intend to modify the returned value without saving it.
 *
 * @param symbols Array of symbols to fetch
 * @returns Map containing historical adjusted close prices for all the given symbols
 * @throws If any yahooFinance.chart() request fails
 */
export const getHistoricalData = async (symbols: string[]) => {
  const historicals = data['historicals'];

  // Missing symbols (not found in storage)
  const missing = symbols.filter((symbol) => !historicals.has(symbol));

  // Outdated symbols (haven't been updated today)
  const outdated = Array.from(historicals.values())
    .filter((historical) => !dayjs(historical.lastUpdated).isSame(dayjs(), 'day'))
    .map((historical) => historical.symbol);

  // If no symbols need updates, can return early
  const needUpdate = [...missing, ...outdated];
  if (needUpdate.length === 0) return historicals;

  const queryOptions = {
    period1: dayjs().subtract(5, 'year').toDate(),
    interval: '1d' as const,
  };

  // Send yahooFinance.chart() requests in parallel
  await Promise.all(needUpdate.map(async (symbol) => {
    const chart = await yahooFinance.chart(symbol, queryOptions);
    const entriesMap = new Map<string, HistoricalEntry>();
    const currency = chart.meta.currency;

    for (const entry of chart.quotes) {
      const { adjclose: adjClose } = entry;
      const date = dayjs(entry.date).format('YYYY-MM-DD');

      // Check that adjClose field is present
      if (adjClose === undefined || adjClose === null) {
        writeLog(`[getHistoricalData]: Skipped a historical entry on ${date} for ${symbol}. Missing 'adjclose' field.`);
        continue;
      }

      entriesMap.set(date, { date, adjClose });
    }

    const lastUpdated = dayjs().format('YYYY-MM-DD');
    const entries = Array.from(entriesMap.values());

    const existingHistorical = historicals.get(symbol);
    if (existingHistorical) {
      existingHistorical.lastUpdated = lastUpdated;
      existingHistorical.entries = entries;
      existingHistorical.currency = currency;
    } else {
      historicals.set(symbol, { symbol, lastUpdated, currency, entries });
    }

    writeLog(`[getHistoricalData]: Successfully updated historical data for ${symbol}.`);
  }));

  setData('historicals', historicals);
  return historicals;
};

/**
 * Gets the exchange rate data from storage, fetching new data if any rates are outdated or missing from storage.
 * Uses the currency saved in `settings.currency` as the target currency (ie. the currency which to convert into).
 *
 * - Returns data by reference. Modifying the returned value will update the data across all files.
 * - You should call `saveData()` if you have made any changes.
 * - Use `structuredClone()` if you intend to modify the returned value without saving it.
 *
 * @param currencyCodes Array of currency codes to fetch
 * @returns Map containing exchange rates for all the given currency codes
 * @throws If any yahooFinance.chart() request fails
 */
export const getExchangeRateData = async (currencyCodes: string[]) => {
  const exchangeRates = data['exchangeRates'];
  const targetCurrency = data['settings'].currency;

  // Remove any rates with different target currency
  for (const [key, exchangeRate] of exchangeRates) {
    if (exchangeRate.to !== targetCurrency) {
      exchangeRates.delete(key);
    }
  }

  // Missing exchange rates (not found in storage)
  const missing = currencyCodes.filter((currency) => !exchangeRates.has(currency));

  // Outdated exchange rates (haven't been updated today)
  const outdated = Array.from(exchangeRates.values())
    .filter((exchangeRate) => !dayjs(exchangeRate.lastUpdated).isSame(dayjs(), 'day'))
    .map((exchangeRate) => exchangeRate.to);

  // If no exchange rates need updates, can return early
  const needUpdate = [...missing, ...outdated];
  if (needUpdate.length === 0) return exchangeRates;

  const queryOptions = {
    period1: dayjs().subtract(5, 'year').toDate(),
    interval: '1d' as const,
  };

  // Send yahooFinance.chart() requests in parallel
  await Promise.all(needUpdate.map(async (currency) => {
    const entries: ExchangeRateEntry[] = [];

    // No need to send request if currency is same as target currency (ie. conversion = 1 : 1)
    if (currency === targetCurrency) {
      let currentDate = dayjs().subtract(5, 'year');
      const today = dayjs();

      while (currentDate.isBefore(today, 'day')) {
        entries.push({
          date: currentDate.format('YYYY-MM-DD'),
          rate: 1,
        });
        currentDate = currentDate.add(1, 'day');
      }
    } else {
      const symbol = `${currency}${targetCurrency}=X`;
      const chart = await yahooFinance.chart(symbol, queryOptions);
      const entriesMap = new Map<string, ExchangeRateEntry>();

      for (const entry of chart.quotes) {
        const { adjclose: rate } = entry;
        const date = dayjs(entry.date).format('YYYY-MM-DD');

        // Check that adjClose field (ie. the rate) is present
        if (rate === undefined || rate === null) {
          writeLog(`[getExchangeRates]: Skipped a exchange rate entry on ${date} for ${symbol}. Missing 'adjclose' field.`);
          continue;
        }

        entriesMap.set(date, { date, rate });
      }

      entries.push(...Array.from(entriesMap.values()));
    }

    const lastUpdated = dayjs().format('YYYY-MM-DD');

    const existingExchangeRate = exchangeRates.get(currency);
    if (existingExchangeRate) {
      existingExchangeRate.lastUpdated = lastUpdated;
      existingExchangeRate.entries = entries;
    } else {
      exchangeRates.set(currency, {
        from: currency,
        to: targetCurrency,
        lastUpdated,
        entries,
      });
    }

    writeLog(`[getExchangeRates]: Successfully updated exchange rate data for ${currency} to ${targetCurrency}.`);
  }));

  setData('exchangeRates', exchangeRates);
  return exchangeRates;
};
