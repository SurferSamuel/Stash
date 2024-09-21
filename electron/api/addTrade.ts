import { getData, setData } from "./core";
import { dayjsDate } from "./format";

// Types
import { 
  AddTradeValues,
  CurrentShareEntry, 
} from "../types";

/**
 * Returns the number of available shares the users own for the given asxcode.
 * 
 * @param asxcode ASX code to check
 * @param accountId Account id to check
 * @returns Number of available shares
 * @throws Throws an error if asxcode does not exist in the storage
 */
export const availableShares = (asxcode: string, accountId: string) => {
  // Get existing data from storage
  const data = getData("companies");

  // If the company's data could not be found...
  const companyData = data.find(entry => entry.asxcode === asxcode);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for ${asxcode}`);
  }

  // Return the number of available shares for the user (0 if the user does not exist)
  return companyData.currentShares
    .filter(entry => entry.accountId === accountId)
    .reduce((acc, cur) => acc + Number(cur.quantity), 0);
}

/**
 * Saves form values for a BUY trade into the datastore.
 * Assumes form values can be parsed as numbers (checked prior by validation).
 * Creates 1 BUY history record of the trade, and 1 CURRENT record of the trade.
 * 
 * @param values "Add Trade" page form values
 * @param gstPercent The GST % to use
 * @throws Throws an error if asxcode does not exist in the storage
 */
export const buyShare = (values: AddTradeValues, gstPercent: string) => {
  // Get existing data from storage
  const data = getData("companies");

  // If the company's data could not be found...
  const companyData = data.find(entry => entry.asxcode === values.asxcode.label);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for ${values.asxcode.label}.`);
  }

  // Ensure accountId was given
  if (values.account.accountId === undefined) {
    throw new Error("ERROR: AccountId is missing.");
  }

  // Calculate values
  const quantity = Number(values.quantity);
  const unitPrice = Number(values.unitPrice);
  const brokerage = Number(values.brokerage);
  const gst = brokerage * (Number(gstPercent) / 100);
  const total = quantity * unitPrice + brokerage + gst;

  // Construct new share entry
  const shareEntry: CurrentShareEntry = {
    accountId: values.account.accountId,
    date: values.date,
    quantity: values.quantity,
    unitPrice: values.unitPrice,
    brokerage: values.brokerage,
    gst: gst.toString(),
  }

  // Add new share entry into company data
  companyData.currentShares.push(shareEntry);
  companyData.buyHistory.push({
    ...shareEntry,
    total: total.toString(),
  });

  // Save datastore
  setData("companies", data);
}

/**
 * Saves form values for a SELL trade into the datastore.
 * Assumes form values can be parsed as numbers (checked prior by validation).
 * Creates 1, or more, "SELL" history records of the trade. 
 * May remove/modify multiple "CURRENT" records.
 * 
 * @param values "Add Trade" page form values
 * @param gstPercent The GST % to use
 * @throws Throws an error if asxcode does not exist in the storage
 */
export const sellShare = (values: AddTradeValues, gstPercent: string) => {
  // Get existing data from storage
  const data = getData("companies");

  // If the company's data could not be found...
  const companyData = data.find(entry => entry.asxcode === values.asxcode.label);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for ${values.asxcode}.`);
  }

  // Ensure accountId was given
  if (values.account.accountId === undefined) {
    throw new Error("ERROR: AccountId is missing.");
  }

  // Retrieve all of the current shares for the user, removing any entries with buy dates
  // after the sell date, sorted in date ascending order
  const currentShares = companyData.currentShares
    .filter(entry => entry.accountId === values.account.accountId && !dayjsDate(entry.date).isAfter(dayjsDate(values.date)))
    .sort((a, b) => dayjsDate(a.date).isBefore(dayjsDate(b.date)) ? -1 : 1);

  // If the user has no shares
  if (currentShares.length === 0) {
    throw new Error(`ERROR: ${values.account.label} has no units for ${values.asxcode.label}`);
  }

  // Check that the user owns enough shares for the trade
  const totalOwned = currentShares.reduce((acc, cur) => acc + Number(cur.quantity), 0);
  if (totalOwned < Number(values.quantity)) {
    throw new Error(`ERROR: Insufficient quantity. Required: ${values.quantity}. Owned: ${totalOwned}`);
  }

  // Calculate the total gst of the sale
  const totalSellGst = Number(values.brokerage) * (Number(gstPercent) / 100);

  // Keep looping until all quantity is accounted for
  let remainingQuantity = Number(values.quantity);
  while (remainingQuantity > 0) {
    // Retrieve next (oldest) share entry
    const entry = currentShares[0];
    const entryQuantity = Number(entry.quantity);
    const entryBuyPrice = Number(entry.unitPrice);

    // Calculate the quantity sold
    const sellQuantity = Math.min(entryQuantity, remainingQuantity);
    remainingQuantity -= sellQuantity;

    // Calculate the buy/sell ratios
    const buyRatio = sellQuantity / entryQuantity;
    const sellRatio = sellQuantity / Number(values.quantity);

    // Calculate applied buy/sell brokerage and GST
    const appliedBuyBrokerage = buyRatio * Number(entry.brokerage);
    const appliedSellBrokerage = sellRatio * Number(values.brokerage);
    const appliedBuyGst = buyRatio * Number(entry.gst);
    const appliedSellGst = sellRatio * totalSellGst;

    // Calculate profit/loss
    const totalCost = (sellQuantity * entryBuyPrice) + appliedBuyBrokerage + appliedBuyGst;
    const totalRevenue = (sellQuantity * Number(values.unitPrice)) - appliedSellBrokerage - appliedSellGst;
    const profitOrLoss = totalRevenue - totalCost;

    // Check if CGT discount (50%) applies
    // This applies if the owner has held onto the asset for more than 12 months (1 year) & made a capital gain
    const cgtDiscount = profitOrLoss > 0 && dayjsDate(values.date).diff(dayjsDate(entry.date), "year", true) > 1;

    // Calculate the capital gain/loss
    // Only apply CGT discount if a capital gain is made & asset was held for >12 months
    const capitalGainOrLoss = (cgtDiscount) ? profitOrLoss / 2 : profitOrLoss;

    // Add new entry into sell history
    companyData.sellHistory.push({
      accountId: values.account.accountId,
      buyDate: entry.date,
      sellDate: values.date,
      quantity: sellQuantity.toString(),
      buyPrice: entry.unitPrice,
      sellPrice: values.unitPrice,
      appliedBuyBrokerage: appliedBuyBrokerage.toString(),
      appliedSellBrokerage: appliedSellBrokerage.toString(),
      appliedBuyGst: appliedBuyGst.toString(),
      appliedSellGst: appliedSellGst.toString(),
      total: totalRevenue.toString(),
      profitOrLoss: profitOrLoss.toString(),
      capitalGainOrLoss: capitalGainOrLoss.toString(),
      cgtDiscount,
    });

    // If the full quantity of the current entry was sold...
    if (sellQuantity === entryQuantity) {
      // Remove the share entry from the current shares
      currentShares.shift();
      const index = companyData.currentShares.indexOf(entry);
      if (index != -1) {
        companyData.currentShares.splice(index, 1);
      }
    } else {
      // ...Otherwise, remove only the amount of shares sold from the current entry
      entry.quantity = (Number(entry.quantity) - sellQuantity).toString();
      entry.brokerage = ((1 - buyRatio) * Number(entry.brokerage)).toString();
      entry.gst = ((1 - buyRatio) * Number(entry.gst)).toString();
    }
  }

  // Save datastore
  setData("companies", data);
}
