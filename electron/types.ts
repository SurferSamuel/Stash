export type Account = {
  name: string;
  accountId: string;
};

export type Country = {
  name: string;
  code: string;
};

export type Note = {
  title: string;
  date: string;
  description: string;
};

export type Alert = {
  description: string;
  created: string;
  triggerType: 'Price Rises Above' | 'Price Falls Below' | 'On Date';
  triggerValue: string;
};

export type Holding = {
  accountId: string;            // Account id that owns the security
  date: string;                 // Date of when the security was originally brought
  quantity: number;             // Number of held units
  price: number;                // Price paid for 1 unit at the time of purchase
  brokerage: number;            // Remaining brokerage from the buy trade
  gst: number;                  // Remaining GST from the buy trade
};

export type BuyHistory = Holding & {
  tradeId: string;              // Id for the trade
  total: number;                // Total amount paid for the trade
};

export type SellHistory = {
  tradeId: string;              // Id for the trade (a single trade may make multiple entries)
  accountId: string;            // Account id that sold the security
  buyDate: string;              // Date of when the security were brought
  sellDate: string;             // Date of when the security were sold
  quantity: number;             // Number of units sold
  buyPrice: number;             // Price paid for 1 unit at the time of purchase
  sellPrice: number;            // Price sold for 1 unit at the time of sale
  appliedBuyBrokerage: number;  // Portion of brokerage paid when brought
  appliedSellBrokerage: number; // Portion of brokerage paid when sold
  appliedBuyGst: number;        // Portion of GST paid when brought
  appliedSellGst: number;       // Portion of GST paid when sold
  total: number;                // Total amount received for the sell trade
  profitOrLoss: number;         // Profit/loss made from the trade (includes brokerage and GST fees)
  capitalGainOrLoss: number;    // Capital gain/loss made by trade
  cgtDiscount: boolean;         // Whether the CGT discount (50%) was applied to the capital gain
};

export type Security = {
  symbol: string;               // Symbol of the security
  name: string;                 // Name of the security
  currency: string;             // Currency of the prices (eg. "AUD", "USD", etc.)
  exchange: string;             // Exchange where the security is listed (eg. "ASX", "LSE", etc.)
  type: string;                 // Type of the security (eg. "Equity", "ETF", etc.)
  countries: Country[];         // Operating countries
  financialStatus: string[];    // User defined financial status options
  miningStatus: string[];       // User defined mining status options
  resources: string[];          // User defined resource options
  products: string[];           // User defined products options
  recommendations: string[];    // User defined recommendation options
  monitor: string[];            // User defined monitor options
  reasonsToBuy: string;         // Description of reasons why buy the security
  reasonsNotToBuy: string;      // Description of reasons why not buy the security
  positives: string;            // Description of positives of the security
  negatives: string;            // Description of negatives of the security
  notes: Note[];                // Notes entries
  alerts: Alert[];              // Alert entries
  holdings: Holding[];          // Current holdings entries
  buyHistory: BuyHistory[];     // History of buy trades (sorted in ascending date order by `date` field, ie. oldest = first, newest = last)
  sellHistory: SellHistory[];   // History of sell trades (sorted in ascending date order by `sellDate` field, ie. oldest = first, newest = last)
};

export type SecurityOption = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
};

import { Quote } from 'yahoo-finance2/script/src/modules/quote';
export type { Quote };

export type Settings = {
  currency: string;
  gstPercent: number;
  brokerageAutoFill?: number;
};

export type HistoricalEntry = {
  date: string; // YYYY-MM-DD
  adjClose: number;
};

export type Historical = {
  symbol: string;
  lastUpdated: string; // YYYY-MM-DD
  currency: string;
  entries: HistoricalEntry[];
};

export type ExchangeRateEntry = {
  date: string; // YYYY-MM-DD
  rate: number;
};

export type ExchangeRate = {
  from: string;
  to: string;
  lastUpdated: string; // YYYY-MM-DD
  entries: ExchangeRateEntry[];
};

export type PortfolioFilterValues = {
  accountId: string;
  countries: string[];
  financialStatus: string[];
  miningStatus: string[];
  resources: string[];
  products: string[];
  recommendations: string[];
};

export type ChartDataPoint = {
  time: string; // YYYY-MM-DD
  value: number;
};

// Chart range values are in months
export const chartRanges = [1, 3, 6, 12, 60] as const;
export type ChartRange = typeof chartRanges[number];
export const chartRangeDisplay: Record<ChartRange, string> = {
  1: '1M',
  3: '3M',
  6: '6M',
  12: '1Y',
  60: '5Y',
};

export type HoldingRow = {
  id: number;                      // Id
  symbol: string;                  // Symbol of the security
  name: string;                    // Name of the security
  currency: string;                // Currency of the prices (eg. "AUD", "USD", etc.)
  exchangeRate: number;            // Exchange rate of currency to target currency
  exchange: string;                // Exchange where the security is listed (eg. "ASX", "LSE", etc.)
  type: string;                    // Type of the security (eg. "Equity", "ETF", etc.)
  units: number;                   // Number of units owned
  buyPrice: number;                // Average price of brought units
  lastPrice: number;               // Last price
  marketValue: number;             // Market value using last price
  purchaseCost: number;            // Purchase cost of all units
  profitOrLoss: number;            // Total profit/loss
  profitOrLossPerc: number | null; // Total profit/loss %
  todayChange: number;             // Today's change in value
  todayChangePerc: number | null;  // Today's change in value %
  firstPurchase: string;           // Earliest purchase date
  lastPurchase: string;            // Latest purchase date
  weightPerc: number;              // Weight %
};

export type TradeRow = {
  id: number;           // Id
  tradeId: string;      // Trade id
  date: string;         // Date when the transaction took place
  accountName: string;  // Name of the account
  type: 'BUY' | 'SELL'; // Type of trade
  symbol: string;       // Symbol of the security
  currency: string;     // Currency of the prices (eg. "AUD", "USD", etc.)
  exchange: string;     // Exchange where the security is listed (eg. "ASX", "LSE", etc.)
  quantity: number;     // Number of units
  price: number;        // Price of the security when the transaction took place
  brokerage: number;    // Brokerage paid
  gst: number;          // GST paid
  total: number;        // Amount paid/received from the trade
};

export type BuyHistoryRow = Omit<BuyHistory, 'accountId'> & {
  id: number;
  accountName: string;
  symbol: string;
  currency: string;
  exchange: string;
};

export type SellHistoryRow = Omit<SellHistory, 'accountId'> & {
  id: number;
  accountName: string;
  symbol: string;
  currency: string;
  exchange: string;
};

export type PortfolioData = {
  chart: ChartDataPoint[];                     // Chart data points
  holdings: HoldingRow[];                      // Holdings data
  trades: TradeRow[];                          // Trade data
  buyHistory: BuyHistoryRow[];                 // Buy history data
  sellHistory: SellHistoryRow[];               // Sell history data
  marketValue: number;                         // Market value using last price
  todayChange: number;                         // Today's change in value
  todayChangePerc: number | null;              // Today's change in value %
  profitOrLoss: number;                        // Total profit/loss
  profitOrLossPerc: number | null;             // Total profit/loss %
  currency: string;                            // Currency code
};

export type AccountData = {
  name: string;                                // Name of the account
  accountId: string;                           // Id of the account
  todayChange: number;                         // Today's change in value
  todayChangePerc: number | null;              // Today's change in value %
  unrealisedProfitOrLoss: number;              // Total unrealised profit/loss
  unrealisedProfitOrLossPerc: number | null;   // Total unrealised profit/loss %
  realisedProfitOrLoss: number;                // Total realised profit/loss
  realisedProfitOrLossPerc: number | null;     // Total realised profit/loss %
  marketValue: number;                         // Market value
  totalCost: number;                           // Total cost
  currency: string;                            // Currency code
};
