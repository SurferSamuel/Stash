use rand::prelude::*;
use tauri::{AppHandle, State};

use crate::{
    store::{save_accounts, save_securities},
    types::Account,
    AppState,
};

/// Generates a random id that is exactly 7 digits long.
fn generate_id() -> String {
    rand::rng().random_range(1_000_000..10_000_000).to_string()
}

/// Creates a new account with the given `name`.
#[tauri::command]
pub async fn add_account(
    app: AppHandle,
    state: State<'_, AppState>,
    name: String,
) -> Result<(), String> {
    let mut accounts = state.accounts.lock().await;

    // Check for duplicate name
    if accounts.values().any(|acc| acc.name == name) {
        let msg = format!("An account named '{name}' already exists.");
        log::error!("{msg}");
        return Err(msg);
    }

    let mut account_id = generate_id();
    while accounts.contains_key(&account_id) {
        account_id = generate_id();
    }

    accounts.insert(account_id.clone(), Account { name, account_id });
    save_accounts(&app, &accounts);

    Ok(())
}

/// Renames the account related to the given `account_id`.
#[tauri::command]
pub async fn rename_account(
    app: AppHandle,
    state: State<'_, AppState>,
    account_id: String,
    name: String,
) -> Result<(), String> {
    let mut accounts = state.accounts.lock().await;

    // Check for duplicate name
    if accounts.values().any(|acc| acc.name == name && acc.account_id != account_id) {
        let msg = format!("An account named '{name}' already exists.");
        log::error!("{msg}");
        return Err(msg);
    }

    let account = accounts
        .get_mut(&account_id)
        .ok_or_else(|| format!("Could not find account_id: {account_id}."))
        .inspect_err(|e| log::error!("{e}"))?;

    account.name = name;

    save_accounts(&app, &accounts);
    Ok(())
}

/// Deletes the account related to the given `account_id`. Also removing any trades associated with the account.
#[tauri::command]
pub async fn delete_account(
    app: AppHandle,
    state: State<'_, AppState>,
    account_id: String,
) -> Result<(), String> {
    let mut accounts = state.accounts.lock().await;
    accounts.remove(&account_id);

    let mut securities = state.securities.lock().await;
    for security in securities.values_mut() {
        security
            .holdings
            .retain(|entry| entry.account_id != account_id);
        security
            .buy_trades
            .retain(|entry| entry.account_id != account_id);
        security
            .sell_trades
            .retain(|entry| entry.account_id != account_id);
    }

    save_accounts(&app, &accounts);
    save_securities(&app, &securities);

    Ok(())
}

/// Returns a list of all accounts in ascending name order.
#[tauri::command]
pub async fn get_accounts(state: State<'_, AppState>) -> Result<Vec<Account>, String> {
    let accounts = state.accounts.lock().await;
    let mut results: Vec<Account> = accounts.values().cloned().collect();
    results.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(results)
}
