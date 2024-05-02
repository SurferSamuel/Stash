import { app, IpcMainEvent, shell } from "electron";
import storage from "electron-json-storage";
import yahooFinance from "yahoo-finance2";
import path from "path";
import fs from "fs";

// Types
import { Data, FetchQuote, Key } from "./types";

/** Fetches the quote for the given asxcode using yahoo-finance2 */
export const fetchQuote = async (event: IpcMainEvent, asxcode: string): Promise<FetchQuote> => {
  try {
    // Send API request using yahoo-finance2
    const quote = await yahooFinance.quote(`${asxcode}.AX`);
    return { quote };
  } catch (error) {
    // Pass the error up the call stack
    throw error;
  }
};

/** Gets the data for a specific key */
export const getData = (event: IpcMainEvent, key: Key): Data => {
  let data = storage.getSync(key);
  // If no data in storage (ie. data is an empty object), set data using default values
  if (data.constructor !== Array && Object.keys(data).length === 0) {
    // Attempt to read default values from data folder
    const fileName = path.join(app.getAppPath(), `./src/assets/data/${key}.json`);
    if (fs.existsSync(fileName)) {
      const datastr = fs.readFileSync(fileName);
      data = JSON.parse(String(datastr));
    }
    // If no file exists, set data to an empty array
    else {
      data = [];
    }
    // Set (save) data in storage
    storage.set(key, data, (error) => {
      if (error) throw error;
    });
  }
  return data as Data;
};

/** Sets (saves) the data for a specific key */
export const setData = (event: IpcMainEvent, key: Key, data: Data) => {
  storage.set(key, data, (error) => {
    if (error) throw error;
  });
};

/** Gets the path to the storage folder (typically in /AppData/Roaming) */
export const getStoragePath = () => {
  return storage.getDataPath();
};

/** Open the storage folder in a new window */
export const openStoragePath = () => {
  shell.openPath(storage.getDataPath());
};
