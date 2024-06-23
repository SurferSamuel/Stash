import { Settings, app, shell } from "electron";
import storage from "electron-json-storage";
import yahooFinance from "yahoo-finance2";
import path from "path";
import fs from "fs";

// Types
import { CompanyData, Country, Data, Key, Option, OptionKey } from "../types";

/*
 * Gets the data for a specific key
 */
export const getData: {
  (key: OptionKey): Option[];
  (key: "countries"): Country[];
  (key: "companies"): CompanyData[];
  (key: "settings"): Settings;
} = (key: Key): any => {
  let data = storage.getSync(key);

  // If data is empty (ie. an empty object), set data using default values
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
    }
    
    // Save data to storage
    storage.set(key, data, (error) => {
      if (error) throw error;
    });
  }

  return data;
};

/*
 * Saves the data for a specific key
 */
export const setData = (key: Key, data: Data) => {
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
 * Fetches the quote for the given asxcode, using yahoo-finance2.
 * If no quote is found (eg. from invalid asxcode), then an error is thrown.
 */
export const fetchQuote = async (asxcode: string) => {
  const quote = await yahooFinance.quote(`${asxcode}.AX`);
  return { quote };
};
