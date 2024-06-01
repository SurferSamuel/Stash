import yahooFinance from "yahoo-finance2";
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
  FilterValues,
  HistoricalEntry,
  HistoricalOptionsEventsHistory,
  Option, 
  PortfolioDataPoint,
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
const getFilteredData = (filterValues: FilterValues): CompanyData[] => {
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
export const getPortfolioTableData = async (filterValues: FilterValues): Promise<PortfolioTableData> => {
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
    const profitOrLossPerc = (profitOrLoss != null) ? (profitOrLoss / totalCost * 100) : null;
    const dailyProfit = (currentPrice != null && previousPrice != null) ? (totalQuantity * (currentPrice - previousPrice)) : null;

    // Add the row into the array
    rows.push({
      id: id++,
      asxcode: company.asxcode,
      units: totalQuantity,
      avgBuyPrice: currencyFormat(avgBuyPrice),
      currentPrice: currencyFormat(currentPrice),
      dailyChangePerc: precentFormat(dailyChangePerc),
      dailyProfit: currencyFormat(dailyProfit),
      profitOrLoss: currencyFormat(profitOrLoss),
      profitOrLossPerc: precentFormat(profitOrLossPerc),
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
export const getPortfolioGraphData = async (filterValues: FilterValues): Promise<PortfolioGraphData | null> => {
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
      if (quote === undefined || quote.regularMarketPrice === undefined) {
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
