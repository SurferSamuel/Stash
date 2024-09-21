import yahooFinance from "yahoo-finance2";
import { writeLog } from "./logs";
import { getData, setData } from "./core";
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
  GraphDataPoint, 
  Option, 
  PortfolioData, 
  PortfolioFilterValues,
  PortfolioTableRow,
} from "../types";

// Set concurrency limit to 16
yahooFinance.setGlobalConfig({ queue: { concurrency: 16 } });

// Custom parse format for dayjs
dayjs.extend(customParseFormat);

/**
 * Gets the data for the graph, table and text components using the given filter values.
 * @param filterValues Provided values for filtering
 * @returns Data for each component
 */
export const getPortfolioData = async (filterValues: PortfolioFilterValues): Promise<PortfolioData> => {
  const companies = getFilteredData(filterValues);

  // If no companies match the filter values
  if (companies.length === 0) {
    return {
      graph: { 1: [], 3: [], 6: [], 12: [], 60: [] },
      table: [],
      text: {
        totalValue: "$0.00",
        dailyChange: "+0.00",
        dailyChangePerc: "0.00%",
        totalChange: "+0.00",
        totalChangePerc: "0.00%",
      }
    }
  }

  // Array of asxcodes ["CBA", ...] and symbols ["CBA.AX", ...]
  const asxcodeArray = companies.map(entry => entry.asxcode); 
  const symbolArray = companies.map(entry => `${entry.asxcode}.AX`);

  // Specify only required fields to save on bandwidth and latency
  const fields = [
    "symbol",
    "regularMarketChangePercent",
    "regularMarketPrice",
    "regularMarketPreviousClose",
  ];

  // Get the quotes and historical data for all the filtered companies
  const quoteArray = await yahooFinance.quote(symbolArray, { fields });
  const historicalData = await getHistoricalData(asxcodeArray);

  let graphId = 1;
  let tableId = 1;
  const graphData: GraphDataPoint[] = [];
  const tableData: PortfolioTableRow[] = [];

  let combinedValue = 0;
  let combinedPreviousValue = 0;
  let combinedCost = 0;

  for (const company of companies) {
    // Get the quote for this company
    const quote = quoteArray.find(entry => entry.symbol === `${company.asxcode}.AX`);
    if (quote === undefined) {
      writeLog(`[getPortfolioData]: Skipped ${company.asxcode}. Could not fetch quote.`);
      continue;
    } 
    
    // Check that all fields were received
    const missingFields = fields.filter(field => !Object.prototype.hasOwnProperty.call(quote, field));
    if (missingFields.length > 0) {
      writeLog(`[getPortfolioData]: Skipped ${company.asxcode}. Missing following fields [${missingFields.join(", ")}].`);
      continue;
    }

    // Get the historicals for this company
    const historicalEntry = historicalData.find(entry => entry.asxcode === company.asxcode);
    if (historicalEntry === undefined) {
      writeLog(`[getPortfolioData]: Skipped ${company.asxcode}. Could not fetch historical data.`);
      continue;
    }

    // Calculate graph data using historical prices
    for (const historical of historicalEntry.historical) {
      // Skip is historical entry is missing adjusted close price
      if (historical.adjclose === undefined) {
        writeLog(`[getPortfolioData]: Skipped a historical entry for ${company.asxcode}. Missing adjclose field.`);
        continue;
      }

      // If historical date is today, don't add an entry as one 
      // will be added later using more recent quote data instead
      if (dayjs().isSame(historical.date, "day")) continue;

      // Calculate the value at the time of the historical entry
      const time = dayjs(historical.date);
      const units = countUnitsAtTime(company, filterValues.account, time);
      const value = units * historical.adjclose;

      // Add value to the existing data point (if possible), otherwise make new data point
      const graphEntry = graphData.find(entry => time.isSame(entry.date, "day"));
      if (graphEntry === undefined) {
        graphData.push({ 
          id: graphId++, 
          date: time.toDate(), 
          value,
        });
      } else {
        graphEntry.value += value;
      }
    }

    let totalQuantity = 0;
    let totalCost = 0;
    let firstPurchaseDate = null;
    let lastPurchaseDate = null;

    // Calculate total quantity and cost for the portfolio
    for (const shareEntry of company.currentShares) {
      // Only add entry if account matches filtered values.
      if (filterValues.account.label === "All Accounts" || filterValues.account.accountId === shareEntry.accountId) {
        const quantity = Number(shareEntry.quantity);
        const unitPrice = Number(shareEntry.unitPrice);
        const fees = Number(shareEntry.brokerage) + Number(shareEntry.gst);

        // Update totals
        totalQuantity += quantity;
        totalCost += (quantity * unitPrice) + fees;

        // Update dates
        if (firstPurchaseDate === null || dayjsDate(shareEntry.date).isBefore(firstPurchaseDate)) {
          firstPurchaseDate = shareEntry.date;
        }
        if (lastPurchaseDate === null || dayjsDate(shareEntry.date).isAfter(lastPurchaseDate)) {
          lastPurchaseDate = shareEntry.date;
        }
      }
    }

    // Don't add a row if no quantity
    if (totalQuantity > 0) {
      const currentPrice = quote.regularMarketPrice;
      const previousPrice = quote.regularMarketPreviousClose;
      const previousUnits = countUnitsAtTime(company, filterValues.account, dayjs().subtract(1, "day"));

      // Update combined totals
      combinedPreviousValue += previousPrice * previousUnits;
      combinedValue += currentPrice * totalQuantity;
      combinedCost += totalCost;

      // Calculate row values
      const avgBuyPrice = totalCost / totalQuantity;
      const marketValue = currentPrice * totalQuantity;
      const profitOrLoss = marketValue - totalCost;
      const profitOrLossPerc = profitOrLoss / totalCost * 100;
      const dailyProfit = totalQuantity * (currentPrice - previousPrice);

      // Add row to table data
      tableData.push({
        id: tableId++,
        asxcode: company.asxcode,
        units: totalQuantity,
        avgBuyPrice,
        currentPrice,
        marketValue,
        purchaseCost: totalCost,
        dailyChangePerc: quote.regularMarketChangePercent,
        dailyProfit,
        profitOrLoss,
        profitOrLossPerc,
        firstPurchaseDate,
        lastPurchaseDate,
        weightPerc: null, // Calculated later
      });

      // Add today's value to the graph data 
      const graphEntry = graphData.find(entry => dayjs().isSame(entry.date, "day"));
      if (graphEntry === undefined) {
        graphData.push({ 
          id: graphId++, 
          date: dayjs().toDate(), 
          value: marketValue,
        });
      } else {
        graphEntry.value += marketValue;
      }
    }
  }

  // Once all table rows have been added, calculate the weight of each row
  for (const row of tableData) {
    row.weightPerc = row.marketValue / combinedValue * 100;
  }

  // Calculate text component fields
  const dailyChange = combinedValue - combinedPreviousValue;
  const dailyChangePerc = (combinedPreviousValue !== 0) ? dailyChange / combinedPreviousValue * 100 : null;
  const totalChange = combinedValue - combinedCost;
  const totalChangePerc = (combinedCost !== 0) ? totalChange / combinedCost * 100 : null;

  return {
    graph: {
      1: graphData.filter(entry => dayjs().subtract(1, "month").isBefore(entry.date, "day")),
      3: graphData.filter(entry => dayjs().subtract(3, "month").isBefore(entry.date, "day")),
      6: graphData.filter(entry => dayjs().subtract(6, "month").isBefore(entry.date, "day")),
      12: graphData.filter(entry => dayjs().subtract(12, "month").isBefore(entry.date, "day")),
      60: graphData.filter(entry => entry.date.getDay() == 1 || dayjs().isSame(entry.date, "day")),
    },
    table: tableData,
    text: {
      totalValue: currencyFormat(combinedValue),
      dailyChange: changeFormat(dailyChange),
      dailyChangePerc: precentFormat(dailyChangePerc).replace("-", ""),
      totalChange: changeFormat(totalChange),
      totalChangePerc: precentFormat(totalChangePerc).replace("-", ""),
    }
  }
}

/**
 * Searches the given `arr` array and checks if all options in the
 * `target` array is found.
 *  * 
 * @param target Array of targets
 * @param arr Array to check for targets
 * @returns Whether all targets were found
 */
const filterOption = (target: Option[], arr: Option[]) => {
  return target.every(val => arr.some(obj => obj.label === val.label));
}

/**
 * Returns the companies that match the filter values.
 * 
 * @param filterValues Provided values for filtering
 * @returns Array of companies matching all filter values
 */
const getFilteredData = (filterValues: PortfolioFilterValues): CompanyData[] => {
  // Check account is provided
  if (filterValues.account === null) return [];

  // Get existing data from storage
  const data = getData("companies");

  // Return the filtered companies
  return data.filter(entry =>
    filterOption(filterValues.financialStatus, entry.financialStatus) &&
    filterOption(filterValues.miningStatus, entry.miningStatus) &&
    filterOption(filterValues.resources, entry.resources) &&
    filterOption(filterValues.products, entry.products) &&
    filterOption(filterValues.recommendations, entry.recommendations) && (
      filterValues.account.label === "All Accounts" || 
      entry.currentShares.some(obj => obj.accountId === filterValues.account.accountId)
    )
  );
}

/**
 * A helper function that counts the number of units the account held at the given
 * time (assumed to be in the past). 
 * 
 * @param company Object containing the company data
 * @param account Which account to check
 * @param time dayjs object of the required time (assumed to be in the past)
 * @returns Number of units
 */
const countUnitsAtTime = (company: CompanyData, account: Option, time: Dayjs) => {
  // Calculate the number of units brought before the given time
  const unitsBrought = company.buyHistory.reduce((total, entry) => {
    // If the account id is correct
    if (account.label === "All Accounts" || account.accountId === entry.accountId) {
      // If the entry buy date was before the given time
      if (dayjsDate(entry.date).isBefore(time)) {
        total += Number(entry.quantity);
      }
    }
    return total;
  }, 0);

  // Calculate the number of units sold before the given time
  const unitsSold = company.sellHistory.reduce((total, entry) => {
    // If the account id is correct
    if (account.label === "All Accounts" || account.accountId === entry.accountId) {
      // If the entry sell date was before the given time
      if (dayjsDate(entry.sellDate).isBefore(time)) {
        total += Number(entry.quantity);
      }
    }
    return total;
  }, 0);

  return unitsBrought - unitsSold;
}

/**
 * A helper function that gets the historical data from storage, fetching new 
 * data if any asxcodes are outdated or missing from the data. The new data is 
 * saved to storage, and returned from this function.
 * 
 * @param asxcodes Array of ASX codes
 * @returns Array containing historical adjusted close prices for all ASX codes
 */
const getHistoricalData = async (asxcodes: string[]) => {
  // Get historical data from storage
  const data = getData("historicals");

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
      // NOTE: Only keep weekly data for entries >1 year ago
      const asxcode = response.value.asxcode;
      const historical = response.value.historical
        .filter(entry => dayjs().diff(entry.date, "year") < 1 || entry.date.getDay() == 1);
      
      // Find the existing entry and update it (if possible), otherwise add a new entry
      const existingEntry = data.find(entry => entry.asxcode === response.value.asxcode);
      if (existingEntry === undefined) {
        data.push({ asxcode, lastUpdated, historical });
      } else {
        existingEntry.lastUpdated = lastUpdated;
        existingEntry.historical = historical;
      }
      writeLog(`[getHistoricalData]: Successfully updated historical data for ${asxcode}.AX.`);
    } else {
      writeLog(`[getHistoricalData]: A historical request could not be fulfilled [${response.reason}].`);
    }
  }

  // Save the updated data
  setData("historicals", data);

  return data;
}
