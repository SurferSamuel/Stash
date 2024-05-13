import { AddCompanyFormValues } from "../src/scenes/addCompany";
import { AddTradeFormValues } from "../src/scenes/addTrade";
import { Country, Data, FetchQuote, Key, CompanyData, Option, OptionKey, Settings } from "./types";

export interface IElectronAPI {
  fetchQuote: (asxcode: string) => Promise<FetchQuote>;
  // Overload function definitions
  getData: {
    (key: OptionKey): Promise<Option[]>;
    (key: "countries"): Promise<Country[]>;
    (key: "companies"): Promise<CompanyData[]>;
    (key: "settings"): Promise<Settings>;
  };
  setData: (key: Key, data: Data) => Promise<void>;
  getStoragePath: () => Promise<string>;
  openStoragePath: () => Promise<void>;
  addCompany: (values: AddCompanyFormValues) => Promise<void>;
  buyShare: (values: AddTradeFormValues, gstPercent: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
