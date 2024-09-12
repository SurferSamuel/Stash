import storage from "electron-json-storage";
import yahooFinance from "yahoo-finance2";
import { writeLog } from "./logs";
import { getData } from "./core";
import { 
  changeFormat, 
  currencyFormat, 
  dayjsDate, 
  precentFormat
} from "./format";

// Dayjs
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Types
import { 
  CompanyData, 
  HistoricalEntry,
  Option, 
  PortfolioDataPoint,
  PortfolioFilterValues,
  PortfolioGraphData,
  PortfolioTableData,
  PortfolioTableRow,
} from "../types";

// Set concurrency limit to 16
yahooFinance.setGlobalConfig({ queue: { concurrency: 16 } });

// Custom parse format for dayjs
dayjs.extend(customParseFormat);

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
const getFilteredData = (filterValues: PortfolioFilterValues): CompanyData[] => {
  // Get existing data from storage
  const data = getData("companies");

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
 * Gets the table rows for the portfolio page that match the given filter values.
 */
export const getPortfolioTableData = async (filterValues: PortfolioFilterValues): Promise<PortfolioTableData> => {
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
  let combinedValue = 0;
  let combinedPreviousValue = 0;
  let combinedCost = 0; 

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
    let firstPurchaseDate = "-";
    let lastPurchaseDate = "-";

    // Loop for all current shares in this company
    for (const shareEntry of company.currentShares) {
      // Only add entry if user matches filtered values. Note: Empty user array = show all users
      if (filterValues.user.length === 0 || filterValues.user.some(obj => obj.label === shareEntry.user)) {
        // Update totals
        const quantity = Number(shareEntry.quantity);
        const unitPrice = Number(shareEntry.unitPrice);
        totalQuantity += quantity;
        totalCost += quantity * unitPrice;

        // Update dates
        if (firstPurchaseDate === "-" || dayjsDate(shareEntry.date).isBefore(firstPurchaseDate)) {
          firstPurchaseDate = shareEntry.date;
        }
        if (lastPurchaseDate === "-" || dayjsDate(shareEntry.date).isAfter(lastPurchaseDate)) {
          lastPurchaseDate = shareEntry.date;
        }
      }
    }

    // If no quantity, don't add row
    if (totalQuantity === 0) continue;

    // Update totals, using the number of units yesterday to calculate yesterday's total value
    const previousUnits = countUnitsAtTime(company, filterValues.user, dayjs().subtract(1, "day"));
    combinedPreviousValue += (previousPrice != null) ? previousPrice * previousUnits : 0;
    combinedValue += (currentPrice != null) ? currentPrice * totalQuantity : 0;
    combinedCost += totalCost;

    // Calculate row values
    const avgBuyPrice = totalCost / totalQuantity;
    const marketValue = (currentPrice != null) ? currentPrice * totalQuantity : null;
    const profitOrLoss = (currentPrice != null) ? currentPrice * totalQuantity - totalCost : null;
    const profitOrLossPerc = (profitOrLoss != null) ? profitOrLoss / totalCost * 100 : null;
    const dailyProfit = (currentPrice != null && previousPrice != null) ? totalQuantity * (currentPrice - previousPrice) : null;

    // Add the row into the array
    rows.push({
      id: id++,
      asxcode: company.asxcode,
      units: totalQuantity,
      avgBuyPrice,
      currentPrice,
      marketValue,
      purchaseCost: totalCost,
      dailyChangePerc,
      dailyProfit,
      profitOrLoss,
      profitOrLossPerc,
      firstPurchaseDate,
      lastPurchaseDate,
      weightPerc: null,
    });
  }

  // Once all rows have been added, calculate the weighting of each row
  for (const row of rows) {
    // Skip if invalid market value
    if (row.marketValue === null) continue;
    row.weightPerc = row.marketValue / combinedValue * 100;
  }

  // Calculate changes
  const dailyChange = combinedValue - combinedPreviousValue;
  const dailyChangePerc = (combinedPreviousValue !== 0) ? dailyChange / combinedPreviousValue * 100 : null;
  const totalChange = combinedValue - combinedCost;
  const totalChangePerc = (combinedCost !== 0) ? totalChange / combinedCost * 100 : null;

  return {
    totalValue: currencyFormat(combinedValue),
    dailyChange: changeFormat(dailyChange),
    dailyChangePerc: precentFormat(dailyChangePerc).replace("-", ""),
    totalChange: changeFormat(totalChange),
    totalChangePerc: precentFormat(totalChangePerc).replace("-", ""),
    rows,
    skipped,
  };
}

/*
 * Gets the data for the portfolio page graph, matching the given filter values.
 */
export const getPortfolioGraphData = async (filterValues: PortfolioFilterValues): Promise<PortfolioGraphData | null> => {
  // Get the filtered companies
  const filteredData = getFilteredData(filterValues);

  // If no companies match the filter values
  if (filteredData.length === 0) {
    return null;
  }

  // Array of asxcodes ["CBA", ...] and symbols ["CBA.AX", ...]
  const asxcodeArray = filteredData.map(entry => entry.asxcode); 
  const symbolArray = filteredData.map(entry => `${entry.asxcode}.AX`);

  // Get the quotes for all filtered companies
  const fields = [ "symbol", "regularMarketPrice" ];
  const quoteArray = await yahooFinance.quote(symbolArray, { fields });

  // Get the historical data for the filtered companies
  const historicalData = await getHistoricalData(asxcodeArray);

  // Object containing the graph data points
  const graphData: PortfolioDataPoint[] = [];

  // Each graphData entry needs to have an id
  let id = 1;

  // Portfolio value is made up of all filtered companies
  for (const company of filteredData) {
    // Try to get the historical result for the company, otherwise skip if not received
    const historicalResult = historicalData.find(entry => entry.asxcode === company.asxcode);
    if (historicalResult === undefined) {
      writeLog(`WARNING: Could not find historical data for ${company.asxcode}`);
      continue;
    }

    // Loop for each entry of the company's historical data
    for (const historical of historicalResult.historical) {
      // If historical date is today, don't add an entry as one 
      // will be added later using more recent quote data instead
      if (dayjs().isSame(historical.date, "day")) continue;

      // Calculate the value at the time of the historical entry
      const time = dayjs(historical.date);
      const units = countUnitsAtTime(company, filterValues.user, time);
      const value = units * historical.adjclose;

      // Add value to the existing data point (if possible), otherwise make new data point
      const graphEntry = graphData.find(entry => time.isSame(entry.date, "day"));
      if (graphEntry === undefined) {
        graphData.push({ id: id++, date: time.toDate(), value });
      } else {
        graphEntry.value += value;
      }
    }
  }

  // Add/update the historical entry for today using the quote data instead of the historical data
  for (const company of filteredData) {
    // Find the quote for this company
    const quote = quoteArray.find(entry => entry.symbol === `${company.asxcode}.AX`);

    // Check that the quote was found and contains the market price
    if (quote === undefined || quote.regularMarketPrice === undefined) {
      writeLog(`WARNING: Quote/market price not found for ${company.asxcode}`);
      continue;
    }

    // Calculate the value as of today
    const time = dayjs();
    const units = countUnitsAtTime(company, filterValues.user, time);
    const value = units * quote.regularMarketPrice;

    // Add value to the existing data point (if possible), otherwise make new data point
    const graphEntry = graphData.find(entry => time.isSame(entry.date, "day"));
    if (graphEntry === undefined) {
      graphData.push({ id: id++, date: time.toDate(), value });
    } else {
      graphEntry.value += value;
    }
  }

  // 1, 3, and 6 month interval data
  const oneMonth = graphData.filter(entry => dayjs().subtract(1, "month").isBefore(entry.date, "day"));
  const threeMonth = graphData.filter(entry => dayjs().subtract(3, "month").isBefore(entry.date, "day"));
  const sixMonth = graphData.filter(entry => dayjs().subtract(6, "month").isBefore(entry.date, "day"));
  
  // 1 and 5 year interval data
  // NOTE: Uses weekly data, not daily data
  const oneYear = graphData.filter(entry => 
    (entry.date.getDay() == 1 && dayjs().subtract(12, "month").isBefore(entry.date, "day")) || 
    dayjs().isSame(entry.date, "day")
  );
  const fiveYear = graphData.filter(entry => entry.date.getDay() == 1 || dayjs().isSame(entry.date, "day"));

  // Return data for each graph range (in months)
  return {
    1: oneMonth,
    3: threeMonth,
    6: sixMonth,
    12: oneYear,
    60: fiveYear,
  };
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
 * A helper function that gets the historical data from storage, fetching new 
 * data if any asxcodes are outdated or missing from the data. The new data is 
 * saved to storage, and returned from this function.
 */
const getHistoricalData = async (asxcodes: string[]) => {
  // Get historical data from storage
  let data = storage.getSync("historicalData") as HistoricalEntry[];

  // If data is empty (ie. file doesn't exist or file is empty), set data as empty array
  if (data.constructor !== Array && Object.keys(data).length === 0) {
    data = [];
  }

  // Missing asxcodes (not found in the storage file)
  const existing = new Set(data.map(entry => entry.asxcode));
  const missing = asxcodes.filter(asxcode => !existing.has(asxcode));

  // Outdated asxcodes (haven't been updated today)
  const outdated = data
    .filter(entry => !dayjsDate(entry.lastUpdated).isSame(dayjs(), "day"))
    .map(entry => entry.asxcode);

  // Update data using only missing and outdated asxcodes
  const needUpdate = [...missing, ...outdated];

  // If no updates needed, can return early
  if (needUpdate.length === 0) return data;

  // Query options for each chart request
  const queryOptions = { 
    period1: dayjs().subtract(5, "year").toDate(), 
    interval: "1d" as const,
  };

  // Send chart requests in parallel (within concurrency limit)
  const responseArray = await Promise.allSettled(needUpdate.map(async (asxcode) => {
    const chart = await yahooFinance.chart(`${asxcode}.AX`, queryOptions);
    const historical = chart.quotes;
    return { asxcode, historical };
  }));

  // Last updated is right now
  const lastUpdated = dayjs().format("DD/MM/YYYY hh:mm A");

  // Update data using responses
  for (const response of responseArray) {
    if (response.status === "fulfilled") {
      // Extract values from response
      // NOTE: Only keep weekly data for entries >6 months ago
      const asxcode = response.value.asxcode;
      const historical = response.value.historical
        .filter(entry => dayjs().diff(entry.date, "month") < 6 || entry.date.getDay() == 1);
      
      // Find the existing entry and update it (if possible), otherwise add a new entry
      const existingEntry = data.find(entry => entry.asxcode === response.value.asxcode);
      if (existingEntry === undefined) {
        data.push({ asxcode, lastUpdated, historical });
      } else {
        existingEntry.lastUpdated = lastUpdated;
        existingEntry.historical = historical;
      }
      writeLog(`Successfully updated historical data for [${asxcode}.AX]`);
    } else {
      writeLog(`WARNING: A historical request could not be fulfilled: ${response.reason}`);
    }
  }

  // Save the updated data
  storage.set("historicalData", data, (error) => {
    if (error) writeLog(`Error in storage.set: ${error}`);
  });

  return data;
}
