use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State};
use uuid::Uuid;

use crate::{
    store::save_securities,
    types::{BuyTrade, Holding, Security, SellTrade},
    utils::parse_date,
    AppState,
};

#[derive(Serialize, Deserialize)]
pub struct TradeData {
    pub account_id: String,
    pub symbol: String,
    pub trade_type: String, // "BUY" or "SELL"
    pub date: String,
    pub quantity: u32,
    pub price: f64,
    pub costs: f64,
}

/// Adds a trade for a security into the application.
#[tauri::command]
pub async fn add_trade(
    app: AppHandle,
    state: State<'_, AppState>,
    data: TradeData,
) -> Result<(), String> {
    if data.quantity <= 0 {
        return Err("Quantity must be > 0.".to_string()).inspect_err(|e| log::error!("{e}"));
    }

    let mut securities = state.securities.lock().await;
    let security = securities
        .get_mut(&data.symbol)
        .ok_or_else(|| format!("Could not find symbol: {}.", data.symbol))
        .inspect_err(|e| log::error!("{e}"))?;

    match data.trade_type.as_str() {
        "BUY" => buy_trade(&data, security),
        "SELL" => sell_trade(&data, security)?,
        _ => {
            return Err(format!("Unknown trade type: {}.", data.trade_type))
                .inspect_err(|e| log::error!("{e}"))
        }
    }

    save_securities(&app, &securities);

    Ok(())
}

/// Adds a buy trade for a security.
fn buy_trade(trade: &TradeData, security: &mut Security) {
    let total = trade.quantity as f64 * trade.price;

    security.holdings.push(Holding {
        account_id: trade.account_id.clone(),
        date: trade.date.clone(),
        quantity: trade.quantity,
        price: trade.price,
        costs: trade.costs,
    });

    security.buy_trades.push(BuyTrade {
        trade_id: Uuid::new_v4().to_string(),
        account_id: trade.account_id.clone(),
        date: trade.date.clone(),
        quantity: trade.quantity,
        price: trade.price,
        costs: trade.costs,
        total,
    });

    // Ensure holdings and buy trades are sorted in ascending date order (oldest first)
    security.holdings.sort_by(|a, b| a.date.cmp(&b.date));
    security.buy_trades.sort_by(|a, b| a.date.cmp(&b.date));
}

/// Adds a sell trade for a security.
fn sell_trade(trade: &TradeData, security: &mut Security) -> Result<(), String> {
    let sell_date = parse_date(&trade.date).inspect_err(|e| log::error!("{e}"))?;

    // Ensure holdings are sorted in ascending date order (oldest first)
    security.holdings.sort_by(|a, b| a.date.cmp(&b.date));

    // Check that the account owns enough units for the trade
    let owned_units: u32 = security
        .holdings
        .iter()
        .filter(|h| {
            h.account_id == trade.account_id
                && parse_date(&h.date).map_or(false, |d| d <= sell_date)
        })
        .map(|h| h.quantity)
        .sum();

    if owned_units < trade.quantity {
        return Err(format!(
            "Insufficient quantity. Required: {}. Owned: {}.",
            trade.quantity, owned_units
        ))
        .inspect_err(|e| log::error!("{e}"));
    }

    let trade_id = Uuid::new_v4().to_string();
    let mut remaining_quantity = trade.quantity;

    security.holdings.retain_mut(|holding| {
        if remaining_quantity == 0
            || holding.account_id != trade.account_id
            || parse_date(&holding.date).map_or(true, |d| d > sell_date)
        {
            return true; // keep holding (skip)
        }

        let quantity_sold = remaining_quantity.min(holding.quantity);
        remaining_quantity -= quantity_sold;

        let buy_ratio = quantity_sold as f64 / holding.quantity as f64;
        let sell_ratio = quantity_sold as f64 / trade.quantity as f64;

        let apportioned_buy_costs = buy_ratio * holding.costs;
        let apportioned_sell_costs = sell_ratio * trade.costs;

        let total_cost = quantity_sold as f64 * holding.price + apportioned_buy_costs;
        let total_revenue = quantity_sold as f64 * trade.price - apportioned_sell_costs;
        let profit_or_loss = total_revenue - total_cost;

        let buy_date = match parse_date(&holding.date) {
            Ok(date) => date,
            Err(e) => {
                log::error!("{e}");
                return true; // keep holding (skip)
            }
        };

        // CGT discount (50%) applies if the owner has:
        //  1. Held onto the asset for more than 12 months, and
        //  2. Made a capital gain.
        let held_days = (sell_date - buy_date).num_days();
        let cgt_discount = held_days > 365 && profit_or_loss > 0.0;
        let capital_gain_or_loss = if cgt_discount {
            profit_or_loss / 2.0
        } else {
            profit_or_loss
        };

        security.sell_trades.push(SellTrade {
            trade_id: trade_id.clone(),
            account_id: trade.account_id.clone(),
            buy_date: holding.date.clone(),
            sell_date: trade.date.clone(),
            quantity: quantity_sold,
            buy_price: holding.price,
            sell_price: trade.price,
            apportioned_buy_costs,
            apportioned_sell_costs,
            total: total_revenue,
            profit_or_loss,
            capital_gain_or_loss,
            cgt_discount,
        });

        if quantity_sold == holding.quantity {
            return false; // fully sold, remove holding
        } else {
            holding.quantity -= quantity_sold;
            holding.costs *= 1.0 - buy_ratio;
            return true; // partially sold, keep holding
        }
    });

    // Ensure sell trades are sorted in ascending sell date order
    security
        .sell_trades
        .sort_by(|a, b| a.sell_date.cmp(&b.sell_date));

    Ok(())
}
