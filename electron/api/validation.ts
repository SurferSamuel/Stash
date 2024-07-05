import yahooFinance from "yahoo-finance2";
import { writeLog } from "./logs";
import { getData } from "./core";

/*
 * Validates the ASX code without sending any requests to yahoo-finance. Used for
 * the "addCompany" page when the submit button is pressed. Faster, but has more
 * basic checking than validateASXCode(). 
 */
export const quickValidateASXCode = (asxcode: string) => {
  // ASX Code must be 3-5 characters long
  if (!/^[a-zA-Z0-9]{3,5}$/.test(asxcode)) {
    return "Must be 3-5 characters";
  }

  // Ensure ASX code is all uppercase
  asxcode = asxcode.toUpperCase();

  // Get existing data from storage
  const data = getData("companies");

  // ASX code must not already exist in data (ie. a new asxcode)
  if (data.some(obj => obj.asxcode === asxcode)) {
    return "Already existing company";
  }

  return "Valid";
}

/*
  * Validates the given asxcode. If existing is true, then the provided asxcode
  * must be existing in the data. Otherwise, if existing is false, then the 
  * provided asxcode must not be existing (ie. a new asxcode).
  */
export const validateASXCode = async (asxcode: string, existing: boolean) => {
  // ASX Code must be 3-5 characters long
  if (!/^[a-zA-Z0-9]{3,5}$/.test(asxcode)) {
    return { status: "Must be 3-5 characters", companyName: "", unitPrice: undefined };
  }

  // Ensure ASX code is all uppercase
  asxcode = asxcode.toUpperCase();

  // Get existing data from storage
  const data = getData("companies");

  // ASX code must already exist in data
  if (existing && !data.some(obj => obj.asxcode === asxcode)) {
    return { status: "Could not find company", companyName: "", unitPrice: undefined };
  }

  // ASX code must not already exist in data (ie. a new asxcode)
  if (!existing && data.some(obj => obj.asxcode === asxcode)) {
    return { status: "Already existing company", companyName: "", unitPrice: undefined };
  }

  try {
    // Send request to yahoo-finance using asxcode
    const fields = ["longName", "shortName", "regularMarketPrice"];
    const quote = await yahooFinance.quote(`${asxcode}.AX`, { fields });
  
    // Ensure company name & share price does exist
    if (!quote?.regularMarketPrice || !(quote.longName ?? quote.shortName)) {
      return { status: "Company not found", companyName: "", unitPrice: undefined };
    }

    // Return valid object with the company's name and share price
    const companyName = quote.longName || quote.shortName;
    const unitPrice = quote.regularMarketPrice.toString();
    return { status: "Valid", companyName, unitPrice };
  } catch (error) {
    writeLog(error);
    return { status: "ERROR: Could not fetch quote", companyName: "", unitPrice: undefined };
  }
}
