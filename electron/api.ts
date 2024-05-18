import { app, IpcMainEvent, shell } from "electron";
import storage from "electron-json-storage";
import yahooFinance from "yahoo-finance2";
import path from "path";
import fs from "fs";

// Dayjs
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

// Types
import { 
  AddCompanyValues, 
  AddTradeValues,
  CompanyData, 
  CurrentShareEntry, 
  Data, 
  FetchQuote,
  FilterValues,
  Key, 
  Option, 
  OptionKey,
  TableRow,
} from "./types";

// Dayjs parser helper function
const toDate = (date: string) => dayjs(date, "DD/MM/YYYY hh:mm A");

// Currency formatter helper function
// Note use USD format "$" instead of AUD format "A$"
const currencyFormat = (num: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

// Percent formatter helper function
const precentFormat = (num: number): string => {
  return num.toFixed(2) + "%";
}

/*
 * Fetches the quote for the given asxcode, using yahoo-finance2.
 * If no quote is found (eg. from invalid asxcode), then an error is thrown.
 */
export const fetchQuote = async (event: IpcMainEvent, asxcode: string): Promise<FetchQuote> => {
  // Send API request using yahoo-finance2
  const quote = await yahooFinance.quote(`${asxcode}.AX`);
  return { quote };
};

/*
 * Gets the data for a specific key
 */
export const getData = (event: IpcMainEvent, key: Key): Data => {
  let data = storage.getSync(key);

  // If data is empty (ie. an empty object), set data using default values
  if (data.constructor !== Array && Object.keys(data).length === 0) {
    // Attempt to read default values from data folder
    const fileName = path.join(app.getAppPath(), `./src/assets/data/${key}.json`);
    if (fs.existsSync(fileName)) {
      const datastr = fs.readFileSync(fileName);
      data = JSON.parse(String(datastr));
    }
    // Encase no file exists, set data to an empty array
    else {
      data = [];
    }
    // Save data to storage
    storage.set(key, data, (error) => {
      if (error) throw error;
    });
  }

  return data as Data;
};

/*
 * Saves the data for a specific key
 */
export const setData = (event: IpcMainEvent, key: Key, data: Data) => {
  storage.set(key, data, (error) => {
    if (error) throw error;
  });
};

/*
 * Gets the path to the storage folder
 */
export const getStoragePath = () => {
  return storage.getDataPath();
};

/*
 * Opens the storage folder in a new window
 */
export const openStoragePath = () => {
  shell.openPath(storage.getDataPath());
};

/*
 * Saves add company form values into the datastore.
 */
export const addCompany = (event: IpcMainEvent, values: AddCompanyValues) => {
  // Save any new options that the user has inputted
  saveNewOptions("miningStatus", values.miningStatus);
  saveNewOptions("financialStatus", values.financialStatus);
  saveNewOptions("resources", values.resources);
  saveNewOptions("products", values.products);
  saveNewOptions("recommendations", values.recommendations);
  saveNewOptions("monitor", values.monitor);

  // Construct new company data object
  const newCompany: CompanyData = {
    asxcode: values.asxcode.toUpperCase(),
    operatingCountries: values.operatingCountries,
    financialStatus: values.financialStatus,
    miningStatus: values.miningStatus,
    resources: values.resources,
    products: values.products,
    recommendations: values.recommendations,
    monitor: values.monitor,
    reasonsToBuy: values.noteToBuy,
    reasonsNotToBuy: values.noteNotToBuy,
    positives: values.notePositives,
    negatives: values.noteNegatives,
    notes: [],
    dateNotifications: [],
    priceNotifications: [],
    currentShares: [],
    buyHistory: [],
    sellHistory: [],
  };

  // If a note was provided
  if (values.noteTitle !== "") {
    newCompany.notes.push({
      title: values.noteTitle,
      date: values.noteDate,
      description: values.noteDescription,
    });
  }

  // If a date notification was provided
  if (values.notificationDateTitle !== "") {
    newCompany.dateNotifications.push({
      title: values.notificationDateTitle,
      date: values.notificationDate,
    });
  }

  // If a price notification was provided
  if (values.notificationPriceHigh !== "" || values.notificationPriceLow !== "") {
    newCompany.priceNotifications.push({
      title: values.notificationPriceTitle,
      lowPrice: values.notificationPriceLow,
      highPrice: values.notificationPriceHigh,
    });
  }

  // Get the existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // Save the new company data into the datastore
  setData(null, "companies", data.concat(newCompany));
}

/*
 * A helper function. Provided a option key and the current options for that key, 
 * saves any new options into the datastore.
 */
const saveNewOptions = (key: OptionKey, currentOptions: Option[]) => {
  // Get the existing options from the datastore
  const existingOptions = getData(null, key) as Option[];

  // Filter the current options to find any new options
  const newOptions = currentOptions.filter((option) => {
    return !existingOptions.some((value) => value.label === option.label);
  });

  // If new options were found...
  if (newOptions.length > 0) {
    // ...save them into the datastore, sorted alphabetically
    const allOptions = existingOptions
      .concat(newOptions)
      .sort((a, b) => a.label.localeCompare(b.label));
    setData(null, key, allOptions);
  }
}

/*
 * Returns the number of available shares for the given asxcode and user.
 * Throws an error if the asxcode does not exist in the datastore
 */
export const availableShares = (event: IpcMainEvent, asxcode: string, user: string): number => {
  // Get existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // If the company's data could not be found...
  const companyData = data.find((entry) => entry.asxcode === asxcode);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for ${asxcode}`);
  }

  // Return the number of available shares for the user (0 if the user does not exist)
  return companyData.currentShares
    .filter((entry) => entry.user === user)
    .reduce((acc, cur) => acc + Number(cur.quantity), 0);
}

/*
 * Saves form values for a BUY trade into the datastore.
 * Assumes form values can be parsed as numbers (checked prior by validation).
 * Creates 1 "BUY" history record of the trade. 
 * Creates 1 "CURRENT" record of the trade.
 * Throws an error if unsuccessful.
 */
export const buyShare = (event: IpcMainEvent, values: AddTradeValues, gstPercent: string) => {
  // Get existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // If the company's data could not be found...
  const companyData = data.find((entry) => entry.asxcode === values.asxcode);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for ${values.asxcode}`);
  }

  // Calculate values
  const quantity = Number(values.quantity);
  const unitPrice = Number(values.unitPrice);
  const brokerage = Number(values.brokerage);
  const gst = brokerage * (Number(gstPercent) / 100);
  const total = quantity * unitPrice + brokerage + gst;

  // Construct new share entry
  const shareEntry: CurrentShareEntry = {
    user: values.user,
    date: values.date,
    quantity: values.quantity,
    unitPrice: values.unitPrice,
    brokerage: values.brokerage,
    gst: gst.toString(),
  }

  // Add new share entry into company data
  companyData.currentShares.push(shareEntry);
  companyData.buyHistory.push({
    ...shareEntry,
    total: total.toString(),
  });

  // Save datastore
  setData(null, "companies", data);
}

/*
 * Saves form values for a SELL trade into the datastore.
 * Assumes form values can be parsed as numbers (checked prior by validation).
 * Creates 1, or more, "SELL" history records of the trade. 
 * May remove/modify multiple "CURRENT" records.
 * Throws an error if unsuccessful.
 */
export const sellShare = (event: IpcMainEvent, values: AddTradeValues, gstPercent: string) => {
  // Get existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // If the company's data could not be found...
  const companyData = data.find((entry) => entry.asxcode === values.asxcode);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for ${values.asxcode}`);
  }

  // Retrieve all of the current shares for the user, removing any entries with buy dates
  // after the sell date, sorted in date ascending order
  const currentShares = companyData.currentShares
    .filter((entry) => entry.user === values.user && !toDate(entry.date).isAfter(toDate(values.date)))
    .sort((a, b) => toDate(a.date).isBefore(toDate(b.date)) ? -1 : 1);

  // If the user has no shares
  if (currentShares.length === 0) {
    throw new Error(`ERROR: ${values.user} has no units for ${values.asxcode}`);
  }

  // Check that the user owns enough shares for the trade
  const totalOwned = currentShares.reduce((acc, cur) => acc + Number(cur.quantity), 0);
  if (totalOwned < Number(values.quantity)) {
    throw new Error(`ERROR: Insufficient quantity. Required: ${values.quantity}. Owned: ${totalOwned}`);
  }

  // Calculate the total gst of the sale
  const totalSellGst = Number(values.brokerage) * (Number(gstPercent) / 100);

  // Keep looping until all quantity is accounted for
  let remainingQuantity = Number(values.quantity);
  while (remainingQuantity > 0) {
    // Retrieve next (oldest) share entry
    const entry = currentShares[0];
    const entryQuantity = Number(entry.quantity);
    const entryBuyPrice = Number(entry.unitPrice);

    // Calculate the quantity sold
    const sellQuantity = Math.min(entryQuantity, remainingQuantity);
    remainingQuantity -= sellQuantity;

    // Calculate the buy/sell ratios
    const buyRatio = sellQuantity / entryQuantity;
    const sellRatio = sellQuantity / Number(values.quantity);

    // Calculate applied buy/sell brokerage and GST
    const appliedBuyBrokerage = buyRatio * Number(entry.brokerage);
    const appliedSellBrokerage = sellRatio * Number(values.brokerage);
    const appliedBuyGst = buyRatio * Number(entry.gst);
    const appliedSellGst = sellRatio * totalSellGst;

    // Calculate profit/loss
    const totalCost = (sellQuantity * entryBuyPrice) + appliedBuyBrokerage + appliedBuyGst;
    const totalRevenue = (sellQuantity * Number(values.unitPrice)) - appliedSellBrokerage - appliedSellGst;
    const profitOrLoss = totalRevenue - totalCost;

    // Check if CGT discount (50%) applies
    // This applies if the owner has held onto the asset for more than 12 months (1 year) & made a capital gain
    const cgtDiscount = profitOrLoss > 0 && toDate(values.date).diff(toDate(entry.date), "year", true) > 1;

    // Calculate the capital gain/loss
    // Only apply CGT discount if a capital gain is made & asset was held for >12 months
    const capitalGainOrLoss = (cgtDiscount) ? profitOrLoss / 2 : profitOrLoss;

    // Add new entry into sell history
    companyData.sellHistory.push({
      user: values.user,
      buyDate: entry.date,
      sellDate: values.date,
      quantity: sellQuantity.toString(),
      buyPrice: entry.unitPrice,
      sellPrice: values.unitPrice,
      appliedBuyBrokerage: appliedBuyBrokerage.toString(),
      appliedSellBrokerage: appliedSellBrokerage.toString(),
      appliedBuyGst: appliedBuyGst.toString(),
      appliedSellGst: appliedSellGst.toString(),
      total: totalRevenue.toString(),
      profitOrLoss: profitOrLoss.toString(),
      capitalGainOrLoss: capitalGainOrLoss.toString(),
      cgtDiscount,
    });

    // If the full quantity of the current entry was sold...
    if (sellQuantity === entryQuantity) {
      // Remove the share entry from the current shares
      currentShares.shift();
      const index = companyData.currentShares.indexOf(entry);
      if (index != -1) {
        companyData.currentShares.splice(index, 1);
      }
    } else {
      // ...Otherwise, remove only the amount of shares sold from the current entry
      entry.quantity = (Number(entry.quantity) - sellQuantity).toString();
      entry.brokerage = ((1 - buyRatio) * Number(entry.brokerage)).toString();
      entry.gst = ((1 - buyRatio) * Number(entry.gst)).toString();
    }
  }

  // Save datastore
  setData(null, "companies", data);
}

/*
 * Gets the table rows for the portfolio page that match the given filter values.
 */
export const getTableRows = async (event: IpcMainEvent, filterValues: FilterValues): Promise<TableRow[]> => {
  // Get existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // Filter companies that match all the filter values (except for user)
  const filteredData = data.filter((entry) => 
    filterValues.financialStatus.every((val) => entry.financialStatus.some(obj => obj.label === val.label)) &&
    filterValues.miningStatus.every((val) => entry.miningStatus.some(obj => obj.label === val.label)) &&
    filterValues.resources.every((val) => entry.resources.some(obj => obj.label === val.label)) &&
    filterValues.products.every((val) => entry.products.some(obj => obj.label === val.label)) &&
    filterValues.recommendations.every((val) => entry.recommendations.some(obj => obj.label === val.label))
  );

  // If no companies match the filter values
  if (filteredData.length === 0) {
    return [];
  }

  // Only ask for these fields to save on bandwidth and latency
  const fields = [
    "symbol",
    "regularMarketPrice",
    "regularMarketChangePercent",
    "regularMarketPreviousClose"
  ];

  // Get the quotes of all the filtered companies
  const asxcodeArray = filteredData.map((entry) => `${entry.asxcode}.AX`);
  const quoteArray = await yahooFinance.quote(asxcodeArray, { fields });
  
  // Loop for each filtered company
  let id = 1;
  const tableRows: TableRow[] = []; 
  for (const company of filteredData) {
    // Find the quote for this company
    const quote = quoteArray.find((entry) => entry.symbol === `${company.asxcode}.AX`);
    if (quote === undefined) {
      throw new Error(`ERROR: Could not fetch quote for ${company.asxcode}`);
    }

    // Get current price and daily change % from quote
    const currentPrice = quote.regularMarketPrice ?? null;
    const dailyChangePerc = quote.regularMarketChangePercent ?? null;
    const previousPrice = quote.regularMarketPreviousClose ?? null;

    let totalQuantity = 0;    // Total units of shares owned
    let totalCost = 0;        // Total cost (including brokerage & gst)
    let totalCostForAvg = 0;  // Total cost (excluding brokerage & gst)

    // Loop for all current shares in this company
    for (const shareEntry of company.currentShares) {
      // Note: Empty string means don't filter for a specific user
      if (filterValues.user === "" || shareEntry.user === filterValues.user) {
        const quantity = Number(shareEntry.quantity);
        const unitPrice = Number(shareEntry.unitPrice);
        const brokerage = Number(shareEntry.brokerage);
        const gst = Number(shareEntry.gst);

        // Update totals
        totalCost += quantity * unitPrice + brokerage + gst;
        totalCostForAvg += quantity * unitPrice;
        totalQuantity += quantity;
      }
    }

    // If no quantity, don't add the row
    if (totalQuantity === 0) continue;

    // Calculate row values
    const avgBuyPrice = totalCostForAvg / totalQuantity;
    const profitOrLoss = (currentPrice != null) ? (currentPrice * totalQuantity - totalCost) : null;
    const profitOrLossPerc = (currentPrice != null) ? (profitOrLoss / totalCost * 100) : null;
    const dailyProfit = (currentPrice != null && previousPrice != null) ? (totalQuantity * (currentPrice - previousPrice)) : null;

    // Add the row into the array
    tableRows.push({
      id: id++,
      asxcode: company.asxcode,
      units: totalQuantity,
      avgBuyPrice: currencyFormat(avgBuyPrice),
      currentPrice: (currentPrice != null) ? currencyFormat(currentPrice) : "-",
      dailyChangePerc: (dailyChangePerc != null) ? precentFormat(dailyChangePerc) : "-",
      dailyProfit: (dailyProfit != null) ? currencyFormat(dailyProfit) : "-",
      profitOrLoss: (profitOrLoss != null) ? currencyFormat(profitOrLoss) : "-",
      profitOrLossPerc: (profitOrLossPerc != null) ? precentFormat(profitOrLossPerc) : "-",
    });
  }

  return tableRows;
}
