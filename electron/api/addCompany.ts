import { getData, setData } from "./core";

// Types
import { 
  AddCompanyValues, 
  CompanyData, 
  Option, 
  OptionKey,
} from "../types";

/**
 * Saves add company form values into the datastore.
 * 
 * @param values "Add Company" page form values
 */
export const addCompany = (values: AddCompanyValues) => {
  // Save any new options that were created
  saveNewOptions("miningStatus", values.miningStatus);
  saveNewOptions("financialStatus", values.financialStatus);
  saveNewOptions("resources", values.resources);
  saveNewOptions("products", values.products);
  saveNewOptions("recommendations", values.recommendations);
  saveNewOptions("monitor", values.monitor);

  // Construct new company data object
  const newCompany: CompanyData = {
    asxcode: values.asxcode.toUpperCase(),
    operatingCountries: values.operatingCountries,
    financialStatus: values.financialStatus,
    miningStatus: values.miningStatus,
    resources: values.resources,
    products: values.products,
    recommendations: values.recommendations,
    monitor: values.monitor,
    reasonsToBuy: values.noteToBuy,
    reasonsNotToBuy: values.noteNotToBuy,
    positives: values.notePositives,
    negatives: values.noteNegatives,
    notes: [],
    dateNotifications: [],
    priceNotifications: [],
    currentShares: [],
    buyHistory: [],
    sellHistory: [],
  };

  // If a note was provided
  if (values.noteTitle !== "") {
    newCompany.notes.push({
      title: values.noteTitle,
      date: values.noteDate,
      description: values.noteDescription,
    });
  }

  // If a date notification was provided
  if (values.notificationDateTitle !== "") {
    newCompany.dateNotifications.push({
      title: values.notificationDateTitle,
      date: values.notificationDate,
    });
  }

  // If a price notification was provided
  if (values.notificationPriceHigh !== "" || values.notificationPriceLow !== "") {
    newCompany.priceNotifications.push({
      title: values.notificationPriceTitle,
      lowPrice: values.notificationPriceLow,
      highPrice: values.notificationPriceHigh,
    });
  }

  // Get the existing data from storage
  const data = getData("companies");

  // Save the new company data into the datastore
  setData("companies", data.concat(newCompany));
}

/**
 * Provided a key and the current options for that key, 
 * saves any new options into storage.
 * 
 * @param key Provided key
 * @param options Current options for the provided key
 */
const saveNewOptions = (key: OptionKey, options: Option[]) => {
  // Get the existing options from the datastore
  const existingOptions = getData(key);

  // Filter the options to find any new ones
  const newOptions = options.filter((option) => {
    return !existingOptions.some(value => value.label === option.label);
  });

  // If new options were found...
  if (newOptions.length > 0) {
    // ...save them into the datastore, sorted alphabetically
    const allOptions = existingOptions
      .concat(newOptions)
      .sort((a, b) => a.label.localeCompare(b.label));
    setData(key, allOptions);
  }
}
