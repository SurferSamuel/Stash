import { Quote } from "yahoo-finance2/dist/esm/src/modules/quote";
import { AddCompanyFormValues } from "../src/scenes/addCompany";
import { AddTradeFormValues } from "../src/scenes/addTrade";
export { PortfolioFormValues as FilterValues } from "../src/scenes/portfolio";

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
  date: string;
  description: string;
}

// Date notification type
export interface DateNotification {
  title: string;
  date: string;
}

// Price notification type
export interface PriceNotification {
  title: string;
  highPrice: string;
  lowPrice: string;
}

// CURRENT share entry type
export interface CurrentShareEntry {
  user: string;                 // User who brought the shares
  date: string;                 // Date of when the shares were originally brought
  quantity: string;             // Number of current outstanding shares
  unitPrice: string;            // Price paid for 1 share at the time of purchase
  brokerage: string;            // Remaining brokerage for the trade
  gst: string;                  // Remaining GST for the trade
}

// BUY history entry type
export interface BuyHistoryEntry {
  user: string;                 // User who brought the shares
  date: string;                 // Date of when the shares were brought
  quantity: string;             // Number of shares brought
  unitPrice: string;            // Price paid for 1 share at the time of purchase
  brokerage: string;            // Brokerage paid for the trade
  gst: string;                  // GST paid for the trade
  total: string;                // Total amount paid for the trade
}

// SELL history entry type
export interface SellHistoryEntry {
  user: string;                 // User who sold the shares
  buyDate: string;              // Date of when the shares were brought
  sellDate: string;             // Date of when the shares were sold
  quantity: string;             // Number of shares sold
  buyPrice: string;             // Price paid for 1 share at the time of purchase
  sellPrice: string;            // Price sold for 1 share at the time of sale
  appliedBuyBrokerage: string;  // Proportion of brokerage paid when brought
  appliedSellBrokerage: string; // Proportion of brokerage paid when sold
  appliedBuyGst: string;        // Proportion of GST paid when brought 
  appliedSellGst: string;       // Proportion of GST paid when sold
  total: string;                // Total amount received for the trade (negative = loss)
  profitOrLoss: string;         // Profit/loss made from the trade (includes brokerage and GST fees)
  capitalGainOrLoss: string;    // Capital gain/loss made by trade (positive = gain, negative = loss)
  cgtDiscount: boolean;         // Whether the CGT discount (50%) was applied to the capital gain.
}

// All data for a given company
export interface CompanyData {
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
  currentShares: CurrentShareEntry[];
  buyHistory: BuyHistoryEntry[];
  sellHistory: SellHistoryEntry[];
}

// Settings type
export interface Settings {
  unitPriceAutoFill: boolean;
  gstPercent: string;
  brokerageAutoFill: string;
}

// Any data type, returned from getData
export type Data = Option[] | Country[] | CompanyData[] | Settings;

// Values type for AddCompany() in ./api.ts
// Override dates with type "string" instead of type "Dayjs" (since can't send "Dayjs" types over IPC)
export interface AddCompanyValues extends Omit<AddCompanyFormValues, "noteDate" | "notificationDate"> {
  noteDate: string;
  notificationDate: string;
}

// Values type for BuyShares() and SellShares() in ./api.ts
// Override dates with type "string" instead of type "Dayjs" (since can't send "Dayjs" types over IPC)
export interface AddTradeValues extends Omit<AddTradeFormValues, "date"> {
  date: string;
}

// Table row type for the portfolio page
export interface PortfolioTableRow {
  id: number;               // ID, eg. 1, 2, 3, ...
  asxcode: string;          // ASX code of the company
  units: number;            // Number of units owned
  avgBuyPrice: string;      // Average price of brought shares
  currentPrice: string;     // Last share price
  dailyChangePerc: string;  // Daily change in share price %
  dailyProfit: string;      // Daily change in profit
  profitOrLoss: string;     // Profit/loss amount
  profitOrLossPerc: string; // Profit/loss %
}

// Return type of getPortfolioTableData() in ./api.ts
export interface PortfolioTableData {
  totalValue: string,             // Total value of the portfolio (as of today)
  dailyChange: string,            // Today's change in portfolio value
  dailyChangePerc: string,        // Today's change in portfolio value %
  totalChange: string,            // Total change in portfolio value
  totalChangePerc: string,        // Total change in portfolio value %
  rows: PortfolioTableRow[],      // Row data for the table
  skipped: string[],              // Companies that were skipped when calculating
}

// Data point type for the portfolio graph
export interface PortfolioDataPoint {
  id: number;
  date: Date;
  value: number;
  [key: string]: number | Date; // To keep TS happy
}

// Return type of getPortfolioGraphData() in ./api.ts
export type PortfolioGraphData = PortfolioDataPoint[];
