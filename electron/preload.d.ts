import { 
  AddCompanyValues, 
  AddTradeValues,
  CompanyData, 
  Country, 
  Data, 
  FetchQuote, 
  FilterValues, 
  Key, 
  Option, 
  OptionKey, 
  Settings,
  TableRow, 
} from "./types";

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
  addCompany: (values: AddCompanyValues) => Promise<void>;
  availableShares: (asxcode: string, user: string) => Promise<number>;
  buyShare: (values: AddTradeValues, gstPercent: string) => Promise<void>;
  sellShare: (values: AddTradeValues, gstPercent: string) => Promise<void>;
  getTableRows: (filterValues: FilterValues) => Promise<TableRow[]>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
