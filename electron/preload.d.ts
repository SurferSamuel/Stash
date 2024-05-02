import { Country, Data, FetchQuote, Key, MainData, Option, OptionKey, Settings } from "./types";

export interface IElectronAPI {
  fetchQuote: (asxcode: string) => Promise<FetchQuote>;
  // Overload function definitions
  getData: {
    (key: OptionKey): Promise<Option[]>;
    (key: "countries"): Promise<Country[]>;
    (key: "data"): Promise<MainData[]>;
    (key: "settings"): Promise<Settings>;
  };
  setData: (key: Key, data: Data) => Promise<void>;
  getStoragePath: () => Promise<string>;
  openStoragePath: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
