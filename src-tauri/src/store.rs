use std::collections::HashMap;

use serde::{de::DeserializeOwned, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;
use yahoo_finance_api::YahooConnector;

use crate::{
    types::{Account, ExchangeRate, Historical, Security},
    AppState,
};

// File names
const ACCOUNTS_FILE: &str = "accounts.json";
const SECURITIES_FILE: &str = "securities.json";
const HISTORICALS_FILE: &str = "historicals.json";
const EXCHANGE_RATES_FILE: &str = "exchange_rates.json";

/// Key used within each store file
const KEY: &str = "data";

/// Loads and deserializes the value from the given store file
fn load<T: DeserializeOwned>(app: &AppHandle, filename: &str) -> HashMap<String, T> {
    app.store(filename)
        .ok()
        .and_then(|store| store.get(KEY))
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default()
}

/// Serializes and writes the value to the given store file
fn save<T: Serialize>(app: &AppHandle, filename: &str, data: &T) {
    if let Ok(store) = app.store(filename) {
        let value = serde_json::to_value(data).expect("Serialization failed");
        store.set(KEY, value);
        let _ = store.save();
    }
}

pub fn load_all(app: &AppHandle) -> AppState {
    AppState {
        accounts: Mutex::new(load(app, ACCOUNTS_FILE)),
        securities: Mutex::new(load(app, SECURITIES_FILE)),
        historicals: Mutex::new(load(app, HISTORICALS_FILE)),
        exchange_rates: Mutex::new(load(app, EXCHANGE_RATES_FILE)),
        yf_provider: Mutex::new(YahooConnector::new().unwrap()),
    }
}

pub fn save_accounts(app: &AppHandle, accounts: &HashMap<String, Account>) {
    save(app, ACCOUNTS_FILE, accounts);
}

pub fn save_securities(app: &AppHandle, securities: &HashMap<String, Security>) {
    save(app, SECURITIES_FILE, securities);
}

pub fn save_historicals(app: &AppHandle, historicals: &HashMap<String, Historical>) {
    save(app, HISTORICALS_FILE, historicals);
}

pub fn save_exchange_rates(app: &AppHandle, exchange_rates: &HashMap<String, ExchangeRate>) {
    save(app, EXCHANGE_RATES_FILE, exchange_rates);
}
