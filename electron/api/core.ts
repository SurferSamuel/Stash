import { Settings, app, shell } from "electron";
import storage from "electron-json-storage";
import { writeLog } from "./logs";
import path from "path";
import fs from "fs";

// Types
import { 
  Account,
  CompanyData, 
  Country, 
  HistoricalEntry, 
  Key, 
  Option, 
  OptionKey,
} from "../types";

// Overload signatures
export function getData(key: OptionKey): Option[];
export function getData(key: "countries"): Country[];
export function getData(key: "accounts"): Account[];
export function getData(key: "companies"): CompanyData[];
export function getData(key: "historicals"): HistoricalEntry[];
export function getData(key: "settings"): Settings;

/**
 * Gets the data for a specific key from the storage file.
 * @param key Provided key
 * @returns The data saved for the specific key
 */
export function getData(key: Key) {
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
      writeLog(`[getData]: Failed to read default values from [${fileName}]`);
    }
    
    // Save data to storage
    storage.set(key, data, (error) => {
      if (error) writeLog(`[storage.set]: ${error}`);
    });
  }

  return data;
}

// Overload signatures
export function setData(key: OptionKey, data: Option[]): void;
export function setData(key: "countries", data: Country[]): void;
export function setData(key: "accounts", data: Account[]): void;
export function setData(key: "companies", data: CompanyData[]): void;
export function setData(key: "historicals", data: HistoricalEntry[]): void;
export function setData(key: "settings", data: Settings): void;

/**
 * Saves the data for a specific key to the storage file.
 * 
 * @param key Provided key
 * @param data The data to save
 */
export function setData(key: Key, data: object): void {
  storage.set(key, data, (error) => {
    if (error) writeLog(`[storage.set]: ${error}`);
  });
}

/**
 * Gets the path to the storage folder.
 * 
 * @returns Full path to storage folder
 */
export const getStoragePath = () => {
  return storage.getDataPath();
};

/**
 * Opens the storage folder in a new window.
 */
export const openStoragePath = () => {
  shell.openPath(storage.getDataPath());
};
