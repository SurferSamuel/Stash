import { app, IpcMainEvent, shell } from "electron";
import storage from "electron-json-storage";
import yahooFinance from "yahoo-finance2";
import path from "path";
import fs from "fs";

// Types
import { CompanyData, Data, FetchQuote, Key, Option, OptionKey, ShareEntry } from "./types";
import { AddTradeFormValues } from "../src/scenes/addTrade";
import { AddCompanyFormValues } from "../src/scenes/addCompany";

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
export const addCompany = (event: IpcMainEvent, values: AddCompanyFormValues) => {
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
    details: {
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
    },
    notes: [],
    dateNotifications: [],
    priceNotifications: [],
    shares: {
      current: [],
      history: [],
    },
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
 * Saves buy share form values into the datastore. 
 * Assumes form values can be parsed as floats (checked prior by validation).
 * Throws an error if unsuccessful.
 */
export const buyShare = (event: IpcMainEvent, values: AddTradeFormValues, gstPercent: string) => {
  // Get existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // If the company's data could not be found...
  const companyData = data.find((obj) => obj.asxcode === values.asxcode);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for '${values.asxcode}'`);
  }

  // Calculate values
  const quantity = parseFloat(values.quantity);
  const unitPrice = parseFloat(values.unitPrice);
  const brokerage = parseFloat(values.brokerage);
  const gst = ((brokerage * parseFloat(gstPercent)) / 100);
  const total = quantity * unitPrice + brokerage + gst;

  // Construct new share object
  const newShare: ShareEntry = {
    user: values.user,
    date: values.date,
    quantity: quantity.toString(),
    unitPrice: unitPrice.toString(),
    brokerage: brokerage.toString(),
    gst: gst.toString(),
    total: total.toString(),
  }

  // Add new share into company
  companyData.shares.current.push(newShare);
  companyData.shares.history.push({
    type: "BUY",
    ...newShare,
  });

  // Save data to datastore
  setData(null, "companies", data);
}
