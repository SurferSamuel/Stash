use std::collections::HashMap;

use tauri::Manager;
use tokio::sync::Mutex;
use yahoo_finance_api::YahooConnector;

use crate::types::{Account, ExchangeRate, Historical, Security};

mod commands;
mod store;
mod types;
mod utils;

struct AppState {
    /// Key = `account_id`
    accounts: Mutex<HashMap<String, Account>>,
    /// Key = `symbol`
    securities: Mutex<HashMap<String, Security>>,
    /// Key = `symbol`
    historicals: Mutex<HashMap<String, Historical>>,
    /// Key = `currency`
    exchange_rates: Mutex<HashMap<String, ExchangeRate>>,
    /// Yahoo finance API provider
    yf_provider: Mutex<YahooConnector>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .setup(|app| {
            app.manage(store::load_all(app.handle()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::accounts::add_account,
            commands::accounts::rename_account,
            commands::accounts::delete_account,
            commands::accounts::get_accounts,
            commands::trades::add_trade,
            commands::search::search,
            commands::info::info,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application.");
}
