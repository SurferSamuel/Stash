import { app, IpcMainEvent, shell } from "electron";
import storage from "electron-json-storage";
import yahooFinance from "yahoo-finance2";
import path from "path";
import fs from "fs";

// Dayjs
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

// Types
import { 
  AddCompanyValues, 
  AddTradeValues,
  CompanyData, 
  CurrentShareEntry, 
  Data, 
  FilterValues,
  HistoricalEntry,
  HistoricalOptionsEventsHistory,
  Key, 
  Option, 
  OptionKey,
  PortfolioDataPoint,
  PortfolioGraphData,
  PortfolioTableData,
  PortfolioTableRow,
} from "./types";

// Set concurrency limit to 16
yahooFinance.setGlobalConfig({ queue: { concurrency: 16 } });

// Dayjs parser helper function
const dayjsDate = (date: string) => dayjs(date, "DD/MM/YYYY hh:mm A");

// Currency formatter helper function
// Eg. 12.3 -> "$12.30"  -12.3 -> "-$12.30"
const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;

// Percentage formatter helper function
// Eg. 12.3 -> "12.30%"  -12.3 -> "-12.30%"
const precentFormat = (num: number) => {
  if (num === null) return "";
  return num.toFixed(2) + "%";
}

// Change formatter helper function
// Eg. 12.3 -> "+12.30"  -12.3 -> "-12.30"
const changeFormat = (num: number) => {
  if (num === null) return "";
  return (num < 0) ? num.toFixed(2).toString() : "+" + num.toFixed(2);
}

/*
 * Fetches the quote for the given asxcode, using yahoo-finance2.
 * If no quote is found (eg. from invalid asxcode), then an error is thrown.
 */
export const fetchQuote = async (event: IpcMainEvent, asxcode: string) => {
  // Send API request using yahoo-finance2
  const quote = await yahooFinance.quote(`${asxcode}.AX`);
  return { quote };
};

/*
 * Gets the data for a specific key
 */
export const getData = (event: IpcMainEvent, key: Key): Data => {
  let data = storage.getSync(key);

  // If data is empty (ie. an empty object), set data using default values
  if (data.constructor !== Array && Object.keys(data).length === 0) {
    const fileName = (app.isPackaged)
      ? path.join(process.resourcesPath, 'data', `${key}.json`)
      : path.join(app.getAppPath(), 'src', 'assets', 'data', `${key}.json`);

    if (fs.existsSync(fileName)) {
      // Read default values from file
      const datastr = fs.readFileSync(fileName);
      data = JSON.parse(String(datastr));
    } else {
      // Encase no file exists, set data to an empty array
      data = [];
    }
    
    // Save data to storage
    storage.set(key, data, (error) => {
      if (error) throw error;
    });
  }

  return data as Data;
};

/*
 * Saves the data for a specific key
 */
export const setData = (event: IpcMainEvent, key: Key, data: Data) => {
  storage.set(key, data, (error) => {
    if (error) throw error;
  });
};

/*
 * Gets the path to the storage folder
 */
export const getStoragePath = () => {
  return storage.getDataPath();
};

/*
 * Opens the storage folder in a new window
 */
export const openStoragePath = () => {
  shell.openPath(storage.getDataPath());
};

/*
 * Saves add company form values into the datastore.
 */
export const addCompany = (event: IpcMainEvent, values: AddCompanyValues) => {
  // Save any new options that the user has inputted
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
  const data = getData(null, "companies") as CompanyData[];

  // Save the new company data into the datastore
  setData(null, "companies", data.concat(newCompany));
}

/*
 * A helper function. Provided a option key and the current options for that key, 
 * saves any new options into the datastore.
 */
const saveNewOptions = (key: OptionKey, currentOptions: Option[]) => {
  // Get the existing options from the datastore
  const existingOptions = getData(null, key) as Option[];

  // Filter the current options to find any new options
  const newOptions = currentOptions.filter((option) => {
    return !existingOptions.some((value) => value.label === option.label);
  });

  // If new options were found...
  if (newOptions.length > 0) {
    // ...save them into the datastore, sorted alphabetically
    const allOptions = existingOptions
      .concat(newOptions)
      .sort((a, b) => a.label.localeCompare(b.label));
    setData(null, key, allOptions);
  }
}

/*
 * Returns the number of available shares for the given asxcode and user.
 * Throws an error if the asxcode does not exist in the datastore
 */
export const availableShares = (event: IpcMainEvent, asxcode: string, user: string) => {
  // Get existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // If the company's data could not be found...
  const companyData = data.find((entry) => entry.asxcode === asxcode);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for ${asxcode}`);
  }

  // Return the number of available shares for the user (0 if the user does not exist)
  return companyData.currentShares
    .filter((entry) => entry.user === user)
    .reduce((acc, cur) => acc + Number(cur.quantity), 0);
}

/*
 * Saves form values for a BUY trade into the datastore.
 * Assumes form values can be parsed as numbers (checked prior by validation).
 * Creates 1 "BUY" history record of the trade. 
 * Creates 1 "CURRENT" record of the trade.
 * Throws an error if unsuccessful.
 */
export const buyShare = (event: IpcMainEvent, values: AddTradeValues, gstPercent: string) => {
  // Get existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // If the company's data could not be found...
  const companyData = data.find((entry) => entry.asxcode === values.asxcode);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for ${values.asxcode}`);
  }

  // Calculate values
  const quantity = Number(values.quantity);
  const unitPrice = Number(values.unitPrice);
  const brokerage = Number(values.brokerage);
  const gst = brokerage * (Number(gstPercent) / 100);
  const total = quantity * unitPrice + brokerage + gst;

  // Construct new share entry
  const shareEntry: CurrentShareEntry = {
    user: values.user,
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
  setData(null, "companies", data);
}

/*
 * Saves form values for a SELL trade into the datastore.
 * Assumes form values can be parsed as numbers (checked prior by validation).
 * Creates 1, or more, "SELL" history records of the trade. 
 * May remove/modify multiple "CURRENT" records.
 * Throws an error if unsuccessful.
 */
export const sellShare = (event: IpcMainEvent, values: AddTradeValues, gstPercent: string) => {
  // Get existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // If the company's data could not be found...
  const companyData = data.find((entry) => entry.asxcode === values.asxcode);
  if (companyData === undefined) {
    throw new Error(`ERROR: Could not find data for ${values.asxcode}`);
  }

  // Retrieve all of the current shares for the user, removing any entries with buy dates
  // after the sell date, sorted in date ascending order
  const currentShares = companyData.currentShares
    .filter((entry) => entry.user === values.user && !dayjsDate(entry.date).isAfter(dayjsDate(values.date)))
    .sort((a, b) => dayjsDate(a.date).isBefore(dayjsDate(b.date)) ? -1 : 1);

  // If the user has no shares
  if (currentShares.length === 0) {
    throw new Error(`ERROR: ${values.user} has no units for ${values.asxcode}`);
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
      user: values.user,
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
  setData(null, "companies", data);
}

/*
 * A helper function used to help filter using options arrays.
 * Searches the given searchArray and checks if all options in the optionsArray is found.
 */ 
const filterOption = (optionsArray: Option[], searchArray: Option[]) => {
  return optionsArray.every(val => searchArray.some(obj => obj.label === val.label));
}

/*
 * A helper function that returns the companies that match the filter values.
 */
const getFilteredData = (filterValues: FilterValues): CompanyData[] => {
  // Get existing data from storage
  const data = getData(null, "companies") as CompanyData[];

  // Return the filtered companies
  return data.filter(entry =>
    filterOption(filterValues.financialStatus, entry.financialStatus) &&
    filterOption(filterValues.miningStatus, entry.miningStatus) &&
    filterOption(filterValues.resources, entry.resources) &&
    filterOption(filterValues.products, entry.products) &&
    filterOption(filterValues.recommendations, entry.recommendations) && (
      // Note: Empty user array = show all users
      filterValues.user.length === 0 || 
      filterValues.user.some(val => entry.currentShares.some(obj => obj.user === val.label))
    )
  );
}

/*
 * A helper function that counts the number of units the user(s) held at the given
 * time (assumed to be in the past). If the users array is empty, then will return
 * the number of units for all users.
 */
const countUnitsAtTime = (company: CompanyData, users: Option[], time: Dayjs) => {
  // Calculate the number of units brought before the given time
  const unitsBrought = company.buyHistory.reduce((total, entry) => {
    // If the user of the entry is correct
    if (users.length === 0 || users.some(obj => obj.label === entry.user)) {
      // If the entry buy date was before the given time
      if (dayjsDate(entry.date).isBefore(time)) {
        total += Number(entry.quantity);
      }
    }
    return total;
  }, 0);

  // Calculate the number of units sold before the given time
  const unitsSold = company.sellHistory.reduce((total, entry) => {
    // If the user of the entry is correct
    if (users.length === 0 || users.some(obj => obj.label === entry.user)) {
      // If the entry sell date was before the given time
      if (dayjsDate(entry.sellDate).isBefore(time)) {
        total += Number(entry.quantity);
      }
    }
    return total;
  }, 0);

  // The total units held at the time is just unitsBrought - unitsSold
  return unitsBrought - unitsSold;
}

/*
 * Gets the table rows for the portfolio page that match the given filter values.
 */
export const getPortfolioTableData = async (event: IpcMainEvent, filterValues: FilterValues): Promise<PortfolioTableData> => {
  // Get the filtered companies
  const filteredData = getFilteredData(filterValues);

  // If no companies match the filter values
  if (filteredData.length === 0) {
    return {
      totalValue: "$0.00",
      dailyChange: "+0.00",
      dailyChangePerc: "0.00%",
      totalChange: "+0.00",
      totalChangePerc: "0.00%",
      rows: [],
      skipped: [],
    };
  }

  // Only ask for these fields to save on bandwidth and latency
  const fields = [
    "symbol",
    "regularMarketPrice",
    "regularMarketChangePercent",
    "regularMarketPreviousClose",
  ];

  // Get the quotes for all the filtered companies
  const symbols = filteredData.map(entry => `${entry.asxcode}.AX`);
  const quoteArray = await yahooFinance.quote(symbols, { fields });
  
  const rows: PortfolioTableRow[] = [];
  const skipped: string[] = [];

  let id = 1;
  let totalValue = 0;
  let previousTotalValue = 0;
  let combinedTotalCost = 0; 

  // Loop for each filtered company
  for (const company of filteredData) {
    // Find the quote for this company
    const quote = quoteArray.find(entry => entry.symbol === `${company.asxcode}.AX`);
    if (quote === undefined) {
      skipped.push(company.asxcode);
      continue;
    }

    // Extract the required info from the quote
    const currentPrice = quote.regularMarketPrice ?? null;
    const dailyChangePerc = quote.regularMarketChangePercent ?? null;
    const previousPrice = quote.regularMarketPreviousClose ?? null;

    let totalQuantity = 0;
    let totalCost = 0;
    let totalCostForAvg = 0;

    // Loop for all current shares in this company
    for (const shareEntry of company.currentShares) {
      // Note: Empty user array = show all users
      if (filterValues.user.length === 0 || filterValues.user.some(obj => obj.label === shareEntry.user)) {
        const quantity = Number(shareEntry.quantity);
        const unitPrice = Number(shareEntry.unitPrice);
        const brokerage = Number(shareEntry.brokerage);
        const gst = Number(shareEntry.gst);

        // Update totals
        totalCost += quantity * unitPrice + brokerage + gst;
        totalCostForAvg += quantity * unitPrice;
        totalQuantity += quantity;
      }
    }

    // Update totals
    // NOTE: Use number of units yesterday to calculate yesterday's total value
    const previousUnits = countUnitsAtTime(company, filterValues.user, dayjs().subtract(1, "day"));
    if (previousPrice != null) previousTotalValue += previousPrice * previousUnits;
    if (currentPrice != null) totalValue += currentPrice * totalQuantity;
    combinedTotalCost += totalCost;

    // If no quantity, don't add row
    if (totalQuantity === 0) continue;

    // Calculate row values
    const avgBuyPrice = totalCostForAvg / totalQuantity;
    const profitOrLoss = (currentPrice != null) ? (currentPrice * totalQuantity - totalCost) : null;
    const profitOrLossPerc = (currentPrice != null) ? (profitOrLoss / totalCost * 100) : null;
    const dailyProfit = (currentPrice != null && previousPrice != null) ? (totalQuantity * (currentPrice - previousPrice)) : null;

    // Add the row into the array
    rows.push({
      id: id++,
      asxcode: company.asxcode,
      units: totalQuantity,
      avgBuyPrice: currencyFormat(avgBuyPrice),
      currentPrice: (currentPrice != null) ? currencyFormat(currentPrice) : "-",
      dailyChangePerc: (dailyChangePerc != null) ? precentFormat(dailyChangePerc) : "-",
      dailyProfit: (dailyProfit != null) ? currencyFormat(dailyProfit) : "-",
      profitOrLoss: (profitOrLoss != null) ? currencyFormat(profitOrLoss) : "-",
      profitOrLossPerc: (profitOrLossPerc != null) ? precentFormat(profitOrLossPerc) : "-",
    });
  }

  // Calculate changes
  const dailyChange = totalValue - previousTotalValue;
  const dailyChangePerc = (previousTotalValue !== 0) ? dailyChange / previousTotalValue * 100 : null;
  const totalChange = totalValue - combinedTotalCost;
  const totalChangePerc = (combinedTotalCost !== 0) ? totalChange / combinedTotalCost * 100 : null;

  return {
    totalValue: currencyFormat(totalValue),
    dailyChange: changeFormat(dailyChange),
    dailyChangePerc: precentFormat(dailyChangePerc).replace("-", ""),
    totalChange: changeFormat(totalChange),
    totalChangePerc: precentFormat(totalChangePerc).replace("-", ""),
    rows,
    skipped,
  };
}

/*
 * A helper function that returns this historical data for the given asxcode and query options.
 * If any request was rejected (eg. from an invalid code), it is removed from the returned array.
 */
const getHistoricalData = async (asxcodes: string[], queryOptions: HistoricalOptionsEventsHistory) => {
  // Send historical requests in parallel (within concurrency limit)
  const historicalResults = await Promise.allSettled(asxcodes.map(async (asxcode) => {
    const historical = await yahooFinance.historical(`${asxcode}.AX`, queryOptions);
    return { asxcode, historical };
  }));

  // Remove any promises that were not fulfilled
  const historicalData: HistoricalEntry[] = [];
  for (const result of historicalResults) {
    if (result.status === "fulfilled") {
      historicalData.push(result.value);
    }
  }
  
  return historicalData;
}

/*
 * Gets the data for the portfolio page graph, matching the given filter values.
 */
export const getPortfolioGraphData = async (event: IpcMainEvent, filterValues: FilterValues): Promise<PortfolioGraphData> => {
  // Get the filtered companies
  const filteredData = getFilteredData(filterValues);

  // If no companies match the filter values
  if (filteredData.length === 0) {
    return null;
  }

  // Object containing the graph data for each interval
  const graphData: Record<"1d" | "1wk", PortfolioDataPoint[]> = {
    "1d": [],
    "1wk": [],
  }

  // A helper function that adds values into the graphData object
  // Returns the next id (if an entry was added), or the original id (if entry already existed)
  const addValueToGraphData = (interval: "1d" | "1wk", id: number, time: Dayjs, value: number) => {
    // Add the value into the graph data array
    const graphEntry = graphData[interval].find(entry => time.isSame(entry.date, "day"));
    if (graphEntry === undefined) {
      // Make new entry if none exists...
      graphData[interval].push({
        id: id++,
        date: time.toDate(),
        value,
      });
    } else {
      // ...otherwise, add the value to the entry
      graphEntry.value += value;
    }

    return id;
  }

  // Array of asxcodes ["CBA", ...] and symbols ["CBA.AX", ...]
  const asxcodes = filteredData.map(entry => entry.asxcode); 
  const symbols = filteredData.map(entry => `${entry.asxcode}.AX`);

  // Get the quotes for all filtered companies
  const fields = [ "symbol", "regularMarketPrice" ];
  const quoteArray = await yahooFinance.quote(symbols, { fields });

  // Max range for daily interval is 6 months, max range for weekly interval is 5 years
  const queryOptions = [
    { period1: dayjs().subtract(6, "month").toDate(), interval: "1d" as const },
    { period1: dayjs().subtract(5, "year").toDate(), interval: "1wk" as const }
  ];

  // Fill the graphData array using both queryOptions
  for (const queryOption of queryOptions) {
    // Get the historical data using the query option
    const historicalData = await getHistoricalData(asxcodes, queryOption);

    // Each graphData entry needs to have an id
    let id = 1;

    // Portfolio value is made up of all filtered companies
    for (const company of filteredData) {
      // Try to get the historical result for the company, otherwise skip if not received
      const historicalResult = historicalData.find(entry => entry.asxcode === company.asxcode);
      if (historicalResult === undefined) continue;

      // Loop for each entry of the company's historical data
      for (const historical of historicalResult.historical) {
        // If historical date is today, don't add an entry as one 
        // will be added later using more recent quote data instead
        if (dayjs().isSame(historical.date, "day")) continue;

        // Calculate the number of units at the time of the historical entry
        const time = dayjs(historical.date);
        const units = countUnitsAtTime(company, filterValues.user, time);

        // Value at the time of historical entry
        const value = units * historical.adjClose;

        // Add the value into the graph data array
        id = addValueToGraphData(queryOption.interval, id, time, value);
      }
    }

    // Add/update the historical entry for today using the quote data instead of the historical data
    for (const company of filteredData) {
      // Find the quote for this company
      const quote = quoteArray.find(entry => entry.symbol === `${company.asxcode}.AX`);

      // Check that the quote was found and contains the market price
      if (quote === undefined || !("regularMarketPrice" in quote)) {
        continue;
      }

      // Calculate the number of units as of today
      const time = dayjs();
      const units = countUnitsAtTime(company, filterValues.user, time);

      // Calculate the value as of today
      const value = units * quote.regularMarketPrice;

      // Add the value into the graph data array
      id = addValueToGraphData(queryOption.interval, id, time, value);
    }
  }

  // Use 1 day intervals for 1-6 month ranges, and 1 week intervals for 1-5 year ranges
  return {
    1: graphData["1d"].filter(entry => dayjs().subtract(1, "month").isBefore(entry.date, "day")),
    3: graphData["1d"].filter(entry => dayjs().subtract(3, "month").isBefore(entry.date, "day")),
    6: graphData["1d"],
    12: graphData["1wk"].filter(entry => dayjs().subtract(12, "month").isBefore(entry.date, "day")),
    60: graphData["1wk"],
  };
}
