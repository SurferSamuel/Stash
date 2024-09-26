import { getData, setData } from "./core";

// Types
import dayjs from "dayjs";

/**
 * Generates a new account id.
 * @returns The new account id
 */
export const generateAccountId = () => {
  const accounts = getData("accounts");

  // Generate a new ID
  let id = crypto.randomUUID();

  // Ensure the id is new and not already used
  while (accounts.some(account => account.accountId === id)) {
    id = crypto.randomUUID();
  }

  return id;
}

/**
 * Creates a new account with the given name and account id.
 * Assumes the account id is unique.
 * @param name Name of the account
 * @param accountId Account id
 * @return Updated accounts array
 */
export const createAccount = (name: string, accountId: string) => {
  const accounts = getData("accounts");
  
  // Add the new account
  accounts.push({
    name,
    accountId,
    created: dayjs().format("DD/MM/YYYY"),
  });

  // Save changes to storage
  setData("accounts", accounts);

  return accounts;
}

/**
 * Renames the account related to the given account id.
 * @param newName The new name of the account
 * @param acocuntId Account id
 * @returns Updated accounts array
 */
export const renameAccount = (newName: string, accountId: string) => {
  const accounts = getData("accounts");

  // Find the account with the given account id
  const accountToEdit = accounts.find(account => account.accountId === accountId);
  if (accountToEdit === undefined) {
    return accounts;
  }
  
  // Rename the account to the new name
  accountToEdit.name = newName;

  // Save changes to storage
  setData("accounts", accounts);
  
  return accounts;
}

/**
 * Deletes the account related to the given account id, also removing any trades
 * associated with the account.
 * @param accountId Account id
 * @return Updated accounts array
 */
export const deleteAccount = (accountId: string) => {
  // Delete the account
  const accounts = getData("accounts").filter(account => account.accountId !== accountId);
  
  // Delete all data relating to the account
  const companies = getData("companies").map(company => {
    return {
      ...company,
      buyHistory: company.buyHistory.filter(entry => entry.accountId !== accountId),
      sellHistory: company.sellHistory.filter(entry => entry.accountId !== accountId),
      currentShares: company.currentShares.filter(entry => entry.accountId !== accountId),
    }
  });

  // Save changes to storage
  setData("accounts", accounts);
  setData("companies", companies);

  return accounts;
}