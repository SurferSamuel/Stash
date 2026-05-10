use serde::{Deserialize, Serialize};
use tauri::State;

use crate::AppState;

#[derive(Serialize, Deserialize)]
pub struct SearchResult {
    pub symbol: String,
    pub name: String,
    pub kind: String,
    pub exchange: String,
}

#[tauri::command]
pub async fn search(
    state: State<'_, AppState>,
    query: String,
) -> Result<Vec<SearchResult>, String> {
    let search_results = state
        .yf_provider
        .lock()
        .await
        .search_ticker_opt(&format!("{query}&lang=en-AU&region=AU&listsCount=0&newsCount=0"))
        .await
        .map_err(|e| e.to_string())
        .inspect_err(|e| log::error!("{e}"))?
        .quotes;

    let mut cleaned_results: Vec<SearchResult> = search_results
        .into_iter()
        .filter_map(|q| {
            Some(SearchResult {
                symbol: q.symbol.clone(),
                name: q.long_name.clone()?,
                exchange: q.exchange.clone(),
                kind: q.quote_type.clone(),
            })
        })
        .collect();

    // Prefer Australian securities higher up the list, but keep exact matches at top
    cleaned_results.sort_by_key(|r| {
        if r.symbol.eq_ignore_ascii_case(&query) {
            0
        } else if r.exchange == "ASX" {
            1
        } else {
            2
        }
    });

    Ok(cleaned_results)
}
