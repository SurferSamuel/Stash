import { Dayjs } from "dayjs";
import { Quote } from "yahoo-finance2/dist/esm/src/modules/quote";

export type FetchQuote = { quote: Quote };

export type OptionKey =
  | "financialStatus"
  | "miningStatus"
  | "monitor"
  | "products"
  | "recommendations"
  | "resources"
  | "users";

export type Key = OptionKey | "countries" | "data" | "settings";

export interface Option {
  label: string;
}

export interface Country {
  label: string;
  code: string;
  phone: string;
  suggested?: boolean;
}

export interface Note {
  title: string;
  date: Dayjs;
  description: string;
}

export interface DateNotification {
  title: string;
  date: Dayjs;
}

export interface PriceNotification {
  title: string;
  highPrice: string;
  lowPrice: string;
}

export interface Share {
  user: string;
  date: Dayjs;
  quantity: string;
  unitCost: string;
  brokerage: string;
  gst: string;
  total: string;
}

export interface MainData {
  asxcode: string;
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
  notes: Note[];
  dateNotifications: DateNotification[];
  priceNotifications: PriceNotification[];
  shares: Share[];
}

export interface Settings {
  unitCostAutoFill: boolean;
  gstPercent: string;
  brokerageAutoFill: string;
}

export type Data = Option[] | Country[] | MainData[] | Settings;
