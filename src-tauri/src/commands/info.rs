use serde::{Deserialize, Serialize};
use tauri::State;
use yahoo_finance_api::{AssetProfile, DefaultKeyStatistics, QuoteType, SummaryDetail};

use crate::AppState;

#[derive(Serialize, Deserialize, Default)]
pub struct HeaderData {
    pub name: Option<String>,
    pub kind: Option<String>,
    pub symbol: Option<String>,
    pub exchange: Option<String>,
    pub currency: Option<String>,
}

impl HeaderData {
    pub fn update_from_quote_type(&mut self, qt: QuoteType) {
        self.name = qt.long_name.or(qt.short_name);
        self.kind = qt.quote_type;
        self.symbol = qt.symbol;
        self.exchange = qt.exchange;
    }

    pub fn update_from_summary_detail(&mut self, sd: &SummaryDetail) {
        self.currency = sd.currency.clone();
    }
}

#[derive(Serialize, Deserialize, Default)]
pub struct SummaryData {
    pub previous_close: Option<f64>,
    pub open: Option<f64>,
    pub day_low: Option<f64>,
    pub day_high: Option<f64>,
    pub beta: Option<f64>,
    pub volume: Option<u64>,
    pub average_volume: Option<u64>,
    pub bid: Option<f64>,
    pub ask: Option<f64>,
    pub bid_size: Option<i64>,
    pub ask_size: Option<i64>,
    pub market_cap: Option<u64>,
    pub fifty_two_week_low: Option<f64>,
    pub fifty_two_week_high: Option<f64>,
    pub trailing_price_to_earnings: Option<f64>,
    pub trailing_price_to_sales: Option<f64>,
}

impl SummaryData {
    pub fn update_from_summary_detail(&mut self, sd: &SummaryDetail) {
        self.previous_close = sd.previous_close;
        self.open = sd.open;
        self.day_low = sd.day_low;
        self.day_high = sd.day_high;
        self.beta = sd.beta;
        self.volume = sd.volume;
        self.average_volume = sd.average_volume;
        self.bid = sd.bid;
        self.ask = sd.ask;
        self.bid_size = sd.bid_size;
        self.ask_size = sd.ask_size;
        self.market_cap = sd.market_cap;
        self.fifty_two_week_low = sd.fifty_two_week_low;
        self.fifty_two_week_high = sd.fifty_two_week_high;
        self.trailing_price_to_earnings = sd.trailing_pe;
        self.trailing_price_to_sales = sd.price_to_sales_trailing12months;
    }
}

#[derive(Serialize, Deserialize, Default)]
pub struct AboutData {
    /// Equity only field
    pub description: Option<String>,
    /// Equity only field
    pub industry: Option<String>,
    /// Equity only field
    pub sector: Option<String>,
    /// Equity only field
    pub employees: Option<u32>,
    /// Equity only field
    pub country: Option<String>,
    /// Etf only field
    pub fund_family: Option<String>,
    /// Etf only field
    pub fund_inception_date: Option<u32>,
    /// Etf only field
    pub legal_type: Option<String>,
}

impl AboutData {
    pub fn update_from_asset_profile(&mut self, ap: AssetProfile) {
        self.description = ap.long_business_summary;
        self.industry = ap.industry;
        self.sector = ap.sector;
        self.employees = ap.full_time_employees;
        self.country = ap.country;
    }

    pub fn update_from_default_key_statistics(&mut self, dks: DefaultKeyStatistics) {
        self.fund_family = dks.fund_family;
        self.fund_inception_date = dks.fund_inception_date;
        self.legal_type = dks.legal_type;
    }
}

#[derive(Serialize, Deserialize, Default)]
pub struct DividendData {
    pub forward_dividend_rate: Option<f64>,
    pub forward_dividend_yield: Option<f64>,
    pub ex_dividend_date: Option<i64>,
    pub payout_ratio: Option<f64>,
    pub trailing_dividend_rate: Option<f64>,
    pub trailing_dividend_yield: Option<f64>,
}

impl DividendData {
    pub fn update_from_summary_detail(&mut self, sd: &SummaryDetail) {
        self.forward_dividend_rate = sd.dividend_rate;
        self.forward_dividend_yield = sd.dividend_yield;
        self.ex_dividend_date = sd.ex_dividend_date;
        self.payout_ratio = sd.payout_ratio;
        self.trailing_dividend_rate = sd.trailing_annual_dividend_rate;
        self.trailing_dividend_yield = sd.trailing_annual_dividend_yield;
    }
}

#[derive(Serialize, Deserialize, Default)]
pub struct Info {
    pub header: HeaderData,
    pub summary: SummaryData,
    pub about: AboutData,
    pub dividends: DividendData,
}

#[tauri::command]
pub async fn info(
    state: State<'_, AppState>,
    symbol: String,
) -> Result<Info, String> {
    let quote_summary = state
        .yf_provider
        .lock()
        .await
        .get_ticker_info(&symbol)
        .await
        .map_err(|e| e.to_string())
        .inspect_err(|e| log::error!("{e}"))?
        .quote_summary
        .ok_or_else(|| format!("Quote summary field missing for symbol: {symbol}"))
        .inspect_err(|e| log::error!("{e}"))?
        .result
        .ok_or_else(|| format!("Result field missing for symbol: {symbol}"))
        .inspect_err(|e| log::error!("{e}"))?
        .into_iter()
        .next()
        .ok_or_else(|| format!("Result list is empty for symbol: {symbol}"))
        .inspect_err(|e| log::error!("{e}"))?;

    let mut info = Info::default();

    if let Some(ap) = quote_summary.asset_profile {
        info.about.update_from_asset_profile(ap);
    }

    if let Some(sd) = quote_summary.summary_detail {
        info.header.update_from_summary_detail(&sd);
        info.summary.update_from_summary_detail(&sd);
        info.dividends.update_from_summary_detail(&sd);
    }

    if let Some(dks) = quote_summary.default_key_statistics {
        info.about.update_from_default_key_statistics(dks);
    }

    if let Some(qt) = quote_summary.quote_type {
        info.header.update_from_quote_type(qt);
    }

    Ok(info)
}

