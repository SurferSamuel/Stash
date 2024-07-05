import { Settings, app, shell } from "electron";
import storage from "electron-json-storage";
import yahooFinance from "yahoo-finance2";
import { writeLog } from "./logs";
import path from "path";
import fs from "fs";

// Types
import { 
  CompanyData, 
  Country, 
  Data, 
  Key, 
  Option, 
  OptionKey,
} from "../types";

/*
 * Gets the data for a specific key
 */
export const getData: {
  (key: OptionKey): Option[];
  (key: "countries"): Country[];
  (key: "companies"): CompanyData[];
  (key: "settings"): Settings;
} = (key: Key): any => {
  // Attempt to get data from storage
  let data = storage.getSync(key);

  // If data is empty (ie. data = {}), set data using default values
  if (data.constructor !== Array && Object.keys(data).length === 0) {
    const fileName = (app.isPackaged)
      ? path.join(process.resourcesPath, 'data', `${key}.json`)
      : path.join(app.getAppPath(), 'src', 'assets', 'data', `${key}.json`);

    if (fs.existsSync(fileName)) {
      // Read default values from file
      const datastr = fs.readFileSync(fileName);
      data = JSON.parse(String(datastr));
    } else {
      // Encase no file exists, set data to an empty array
      data = [];
      writeLog(`WARNING: Failed to read default values from [${fileName}]`);
    }
    
    // Save data to storage
    storage.set(key, data, (error) => {
      if (error) writeLog(`Error in storage.set: ${error}`);
    });
  }

  return data;
};

/*
 * Saves the data for a specific key
 */
export const setData = (key: Key, data: Data) => {
  storage.set(key, data, (error) => {
    if (error) writeLog(`Error in storage.set: ${error}`);
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
 * Validates the given asxcode. If existing is true, then the provided asxcode
 * must be existing in the data. Otherwise, if existing is false, then the 
 * provided asxcode must not be existing (ie. a new asxcode).
 */
export const validateASXCode = async (asxcode: string, existing: boolean) => {
  // ASX Code must be 3-5 characters long
  if (!/^[a-zA-Z0-9]{3,5}$/.test(asxcode)) {
    return { status: "Must be 3-5 characters", companyName: "", unitPrice: undefined };
  }

  // Ensure ASX code is all uppercase
  asxcode = asxcode.toUpperCase();

  // Get existing data from storage
  const data = getData("companies");

  // ASX code must already exist in data
  if (existing && !data.some(obj => obj.asxcode === asxcode)) {
    return { status: "Could not find company", companyName: "", unitPrice: undefined };
  }

  // ASX code must not already exist in data (ie. a new asxcode)
  if (!existing && data.some(obj => obj.asxcode === asxcode)) {
    return { status: "Already existing company", companyName: "", unitPrice: undefined };
  }

  try {
    // Send request to yahoo-finance using asxcode
    const fields = ["longName", "shortName", "regularMarketPrice"];
    const quote = await yahooFinance.quote(`${asxcode}.AX`, { fields });
  
    // If no quote was found, then asxcode was invalid
    // Also, ensure company name & share price does exist
    if (!quote?.regularMarketPrice || !(quote.longName ?? quote.shortName)) {
      return { status: "Company not found", companyName: "", unitPrice: undefined };
    }

    // Return valid object with the company's name and share price
    const companyName = quote.longName || quote.shortName;
    const unitPrice = quote.regularMarketPrice.toString();
    return { status: "Valid", companyName, unitPrice };
  } catch (error) {
    writeLog(error);
    return { status: "ERROR: Could not fetch quote", companyName: "", unitPrice: undefined };
  }
}
