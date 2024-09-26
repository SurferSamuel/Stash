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
  getData: {
    (key: OptionKey): Promise<Option[]>;
    (key: "countries"): Promise<Country[]>;
    (key: "accounts"): Promise<Account[]>;
    (key: "companies"): Promise<CompanyData[]>;
    (key: "historicals"): Promise<HistoricalEntry[]>;
    (key: "settings"): Promise<Settings>;
  };
  setData: {
    (key: OptionKey, data: Option[]): Promise<void>;
    (key: "countries", data: Country[]): Promise<void>;
    (key: "accounts", data: Account[]): Promise<void>;
    (key: "companies", data: CompanyData[]): Promise<void>;
    (key: "historicals", data: HistoricalEntry[]): Promise<void>;
    (key: "settings", data: Settings): Promise<void>;
  };
  getStoragePath: () => Promise<string>;
  openStoragePath: () => Promise<void>;
  quickValidateASXCode: (asxcode: string) => Promise<string>;
  validateASXCode: (asxcode: string, existing: boolean) => Promise<ValidateASXReturn>;
  addCompany: (values: AddCompanyValues) => Promise<void>;
  availableShares: (asxcode: string, accountId: string) => Promise<number>;
  buyShare: (values: AddTradeValues, gstPercent: string) => Promise<void>;
  sellShare: (values: AddTradeValues, gstPercent: string) => Promise<void>;
  getPortfolioData: (filterValues: PortfolioFilterValues) => Promise<PortfolioData>;
  generateAccountId: () => Promise<string>;
  createAccount: (name: string, accountId: string) => Promise<Account[]>;
  renameAccount: (newName: string, accountId: string) => Promise<Account[]>;
  deleteAccount: (accountId: string) => Promise<Account[]>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
