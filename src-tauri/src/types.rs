use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Account {
    pub name: String,
    pub account_id: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct Holding {
    /// Account id that owns the security.
    pub account_id: String,
    /// Date of when the security was originally brought, formatted as "YYYY-MM-DD".
    pub date: String,
    /// Number of held units.
    pub quantity: u32,
    /// Price paid for 1 unit at the time of purchase.
    pub price: f64,
    /// Remaining transactions costs from the buy trade.
    pub costs: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BuyTrade {
    /// Id for the trade.
    pub trade_id: String,
    /// Account id that brought the security.
    pub account_id: String,
    /// Date of the trade, formatted as "YYYY-MM-DD".
    pub date: String,
    /// Number of units brought.
    pub quantity: u32,
    /// Price paid for 1 unit at the time of purchase.
    pub price: f64,
    /// Transactions costs of the trade.
    pub costs: f64,
    /// Total amount paid for the trade.
    pub total: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SellTrade {
    /// Id for the trade (not unique, a single trade may make multiple sell entries).
    pub trade_id: String,
    /// Account id that sold the security.
    pub account_id: String,
    /// Date of when the security was brought, formatted as "YYY-MM-DD".
    pub buy_date: String,
    /// Date of when the security was sold, formatted as "YYYY-MM-DD".
    pub sell_date: String,
    /// Number of units sold.
    pub quantity: u32,
    /// Price paid for 1 unit at the time of purchase.
    pub buy_price: f64,
    /// Price sold for 1 unit at the time of sale.
    pub sell_price: f64,
    /// Apportion of costs paid when brought.
    pub apportioned_buy_costs: f64,
    /// Apportion of costs paid when sold.
    pub apportioned_sell_costs: f64,
    /// Total amount received from the sell trade.
    pub total: f64,
    /// Profit/loss made by the trade (includes costs).
    pub profit_or_loss: f64,
    /// Capital gain/loss made by trade (may include CGT discount if applicable).
    pub capital_gain_or_loss: f64,
    /// Whether the CGT discount (50%) was applied to the capital gain.
    pub cgt_discount: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Security {
    /// Symbol of the security.
    pub symbol: String,
    /// Name of the security.
    pub name: String,
    /// Currency of the prices (eg. "AUD", "USD", etc.).
    pub currency: String,
    /// Exchange where the security is listed (eg. "ASX", "LSE", etc.).
    pub exchange: String,
    /// Type of security (eg. "Equity", "ETF", etc.)
    // pub kind: String,
    /// Current holdings.
    pub holdings: Vec<Holding>,
    /// History of buy trades.
    pub buy_trades: Vec<BuyTrade>,
    /// History of sell trades.
    pub sell_trades: Vec<SellTrade>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct HistoricalEntry {
    /// Date of historical price entry, formatted as "YYYY-MM-DD".
    pub date: String,
    /// Adjusted close price.
    pub adj_close: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Historical {
    /// Symbol for the security.
    pub symbol: String,
    /// Date when last updated, formatted as "YYYY-MM-DD".
    pub last_updated: String,
    /// Currency of the prices (eg. "AUD", "USD", etc.).
    pub currency: String,
    /// Historical price data.
    pub entries: Vec<HistoricalEntry>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExchangeRateEntry {
    /// Date of exchange rate entry, formatted as "YYYY-MM-DD".
    pub date: String,
    /// Exchange rate.
    pub rate: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExchangeRate {
    /// Base currency (eg. "AUD" for AUD/USD).
    pub from: String,
    /// Quote currency (eg. "USD" for AUD/USD).
    pub to: String,
    /// Date when last updated, formatted as "YYYY-MM-DD".
    pub last_updated: String,
    /// Historical exchange rate data.
    pub entries: Vec<ExchangeRateEntry>,
}
