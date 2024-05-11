import { Dayjs } from "dayjs";
import { Quote } from "yahoo-finance2/dist/esm/src/modules/quote";

// Fetched quote return type from yahoo-finance2
export type FetchQuote = { quote: Quote };

// Valid option keys, used for company details and users
export type OptionKey =
  | "financialStatus"
  | "miningStatus"
  | "monitor"
  | "products"
  | "recommendations"
  | "resources"
  | "users";

// All valid keys
export type Key = OptionKey | "countries" | "companies" | "settings";

// Dropdown option type
export interface Option {
  label: string;
}

// Dropdown country type
export interface Country {
  label: string;
  code: string;
  phone: string;
  suggested?: boolean;
}

// Written note type
export interface Note {
  title: string;
  date: Dayjs;
  description: string;
}

// Date notification type
export interface DateNotification {
  title: string;
  date: Dayjs;
}

// Price notification type
export interface PriceNotification {
  title: string;
  highPrice: string;
  lowPrice: string;
}

// Share entry type
export interface ShareEntry {
  user: string;
  date: Dayjs;
  quantity: string;
  unitPrice: string;
  brokerage: string;
  gst: string;
  total: string;
}

// Transaction entry type
export interface TransactionEntry {
  type: "BUY" | "SELL";
  user: string;
  date: Dayjs;
  quantity: string;
  unitPrice: string;
  brokerage: string;
  gst: string;
  total: string;
}

// All data for a given company
export interface CompanyData {
  asxcode: string;
  details: {
    operatingCountries: Country[];
    financialStatus: Option[];
    miningStatus: Option[];
    resources: Option[];
    products: Option[];
    recommendations: Option[];
    monitor: Option[];
    reasonsToBuy: string;
    reasonsNotToBuy: string;
    positives: string;
    negatives: string;
  };
  notes: Note[];
  dateNotifications: DateNotification[];
  priceNotifications: PriceNotification[];
  shares: {
    current: ShareEntry[];
    history: TransactionEntry[];
  };
}

// Settings type
export interface Settings {
  unitPriceAutoFill: boolean;
  gstPercent: string;
  brokerageAutoFill: string;
}

// Any data type, returned from getData
export type Data = Option[] | Country[] | CompanyData[] | Settings;
