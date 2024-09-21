import { 
  Account,
  AddCompanyValues, 
  AddTradeValues,
  CompanyData, 
  Country, 
  Data, 
  HistoricalEntry,
  Key, 
  Option, 
  OptionKey, 
  PortfolioFilterValues, 
  PortfolioData,
  Settings,
  ValidateASXReturn,
} from "./types";

export interface IElectronAPI {
  // Overload function definitions
  getData: {
    (key: OptionKey): Promise<Option[]>;
    (key: "countries"): Promise<Country[]>;
    (key: "accounts"): Promise<Account[]>;
    (key: "companies"): Promise<CompanyData[]>;
    (key: "historicals"): Promise<HistoricalEntry[]>;
    (key: "settings"): Promise<Settings>;
  };
  setData: (key: Key, data: Data) => Promise<void>;
  getStoragePath: () => Promise<string>;
  openStoragePath: () => Promise<void>;
  quickValidateASXCode: (asxcode: string) => Promise<string>;
  validateASXCode: (asxcode: string, existing: boolean) => Promise<ValidateASXReturn>;
  addCompany: (values: AddCompanyValues) => Promise<void>;
  availableShares: (asxcode: string, accountId: string) => Promise<number>;
  buyShare: (values: AddTradeValues, gstPercent: string) => Promise<void>;
  sellShare: (values: AddTradeValues, gstPercent: string) => Promise<void>;
  getPortfolioData: (filterValues: PortfolioFilterValues) => Promise<PortfolioData>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
