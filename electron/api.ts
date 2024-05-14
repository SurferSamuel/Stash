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
  Key, 
  Option, 
  OptionKey,
  SellHistoryEntry, 
} from "./types";

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
 * Saves form values for a BUY trade into the datastore.
 * Assumes form values can be parsed as floats (checked prior by validation).
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
    throw new Error(`ERROR: Could not find data for '${values.asxcode}'`);
  }

  // Calculate values
  const quantity = parseFloat(values.quantity);
  const unitPrice = parseFloat(values.unitPrice);
  const brokerage = parseFloat(values.brokerage);
  const gst = brokerage * (parseFloat(gstPercent) / 100);
  const total = quantity * unitPrice + brokerage + gst;

  // Construct new share entry
  const shareEntry: CurrentShareEntry = {
    user: values.user,
    date: values.date,
    quantity: quantity.toFixed(2).toString(),
    unitPrice: unitPrice.toFixed(2).toString(),
    brokerage: brokerage.toFixed(2).toString(),
    gst: gst.toFixed(2).toString(),
  }

  // Add new share entry into company data
  companyData.currentShares.push(shareEntry);
  companyData.buyHistory.push({
    ...shareEntry,
    total: total.toFixed(2).toString(),
  });

  // Save datastore
  setData(null, "companies", data);
}

/*
 * Saves form values for a SELL trade into the datastore.
 * Assumes form values can be parsed as floats (checked prior by validation).
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
    throw new Error(`ERROR: Could not find data for '${values.asxcode}'`);
  }

  // Retrieve all of the current shares for the user, removing any entries with buy dates
  // after the sell date, sorted in date ascending order
  const currentShares = companyData.currentShares
    .filter((entry) => entry.user === values.user && !dayjs(entry.date, "DD/MM/YYYY").isAfter(dayjs(values.date, "DD/MM/YYYY")))
    .sort((a, b) => dayjs(a.date, "DD/MM/YYYY").isBefore(dayjs(b.date, "DD/MM/YYYY")) ? -1 : 1);

  // If the user has no shares
  if (currentShares.length === 0) {
    throw new Error(`ERROR: User '${values.user}' has no outstanding shares for '${values.asxcode}'`);
  }

  // Check that the user owns enough shares for the trade
  const totalOwned = currentShares.reduce((acc, cur) => acc + parseFloat(cur.quantity), 0);
  if (totalOwned < parseFloat(values.quantity)) {
    throw new Error(`ERROR: Insufficient quantity. Required: ${values.quantity}. Owned: ${totalOwned}`);
  }

  // Calculate the total gst of the sale
  const totalSellGst = parseFloat(values.brokerage) * (parseFloat(gstPercent) / 100);

  // Keep looping until all quantity is accounted for
  let remainingQuantity = parseFloat(values.quantity);
  while (remainingQuantity > 0) {
    // Retrieve next (oldest) share entry
    const entry = currentShares[0];
    const entryQuantity = parseFloat(entry.quantity);
    const entryBuyPrice = parseFloat(entry.unitPrice);

    // Calculate the quantity sold
    const sellQuantity = Math.min(entryQuantity, remainingQuantity);
    remainingQuantity -= sellQuantity;

    // Calculate the buy/sell ratios
    const buyRatio = sellQuantity / entryQuantity;
    const sellRatio = sellQuantity / parseFloat(values.quantity);

    // Calculate applied buy/sell brokerage and GST
    const appliedBuyBrokerage = buyRatio * parseFloat(entry.brokerage);
    const appliedSellBrokerage = sellRatio * parseFloat(values.brokerage);
    const appliedBuyGst = buyRatio * parseFloat(entry.gst);
    const appliedSellGst = sellRatio * totalSellGst;

    // Calculate profit/loss
    const totalCost = (sellQuantity * entryBuyPrice) + appliedBuyBrokerage + appliedBuyGst;
    const totalRevenue = (sellQuantity * parseFloat(values.unitPrice)) - appliedSellBrokerage - appliedSellGst;
    const profitOrLoss = totalRevenue - totalCost;

    // Check if CGT discount (50%) applies
    // This applies if the owner has held onto the asset for more than 12 months (1 year) & made a capital gain
    const cgtDiscount = profitOrLoss > 0 && dayjs(values.date, "DD/MM/YYYY").diff(dayjs(entry.date, "DD/MM/YYYY"), "year", true) > 1;

    // Calculate the capital gain/loss
    // Only apply CGT discount if a capital gain is made & asset was held for >12 months
    const capitalGainOrLoss = (cgtDiscount) ? profitOrLoss / 2 : profitOrLoss;

    // Add new entry into sell history
    companyData.sellHistory.push({
      user: values.user,
      buyDate: entry.date,
      sellDate: values.date,
      quantity: sellQuantity.toFixed(2).toString(),
      buyPrice: parseFloat(entry.unitPrice).toFixed(2).toString(),
      sellPrice: values.unitPrice,
      appliedBuyBrokerage: appliedBuyBrokerage.toFixed(2).toString(),
      appliedSellBrokerage: appliedSellBrokerage.toFixed(2).toString(),
      appliedBuyGst: appliedBuyGst.toFixed(2).toString(),
      appliedSellGst: appliedSellGst.toFixed(2).toString(),
      total: totalRevenue.toFixed(2).toString(),
      profitOrLoss: profitOrLoss.toFixed(2).toString(),
      capitalGainOrLoss: capitalGainOrLoss.toFixed(2).toString(),
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
      entry.quantity = (parseFloat(entry.quantity) - sellQuantity).toFixed(2).toString();
      entry.brokerage = ((1 - buyRatio) * parseFloat(entry.brokerage)).toFixed(2).toString();
      entry.gst = ((1 - buyRatio) * parseFloat(entry.gst)).toFixed(2).toString();
    }
  }

  // Save datastore
  setData(null, "companies", data);
}
