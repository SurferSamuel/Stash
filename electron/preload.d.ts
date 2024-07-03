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
  PortfolioGraphData,
  PortfolioTableData,
  Settings,
  ValidateASXReturn,
} from "./types";

export interface IElectronAPI {
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
  validateASXCode: (asxcode: string, existing: boolean) => Promise<ValidateASXReturn>;
  addCompany: (values: AddCompanyValues) => Promise<void>;
  availableShares: (asxcode: string, user: string) => Promise<number>;
  buyShare: (values: AddTradeValues, gstPercent: string) => Promise<void>;
  sellShare: (values: AddTradeValues, gstPercent: string) => Promise<void>;
  getPortfolioTableData: (filterValues: FilterValues) => Promise<PortfolioTableData>;
  getPortfolioGraphData: (filterValues: FilterValues) => Promise<PortfolioGraphData>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
