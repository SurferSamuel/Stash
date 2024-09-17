import dayjs from "dayjs";

/**
 * Currency formatter helper function.
 * 
 * @example
 *  12.3 -> "$12.30"
 * -12.3 -> "-$12.30"
 * 
 * @param value The number to be formated
 * @param decimals Number of decimal places (default = 2)
 * @returns Formatted currency as a string
 */
export const currencyFormat = (value: number | null, decimals = 2) => {
  if (value === null) return "-";
  return Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: decimals,
  }).format(value);
};

/**
 * Percentage formatter helper function.
 * 
 * @example
 *  12.3 -> "12.30%"
 * -12.3 -> "-$12.30%"
 * 
 * @param value The number to be formated
 * @param decimals Number of decimal places (default = 2)
 * @returns Formatted percentage as a string
 */
export const precentFormat = (value: number | null, decimals = 2) => {
  if (value === null) return "-";
  return value.toFixed(decimals) + "%";
}

/**
 * Change formatter helper function.
 * 
 * @example
 *  12.3 -> "+12.30"
 * -12.3 -> "-12.30"
 * 
 * @param value The number to be formated
 * @param decimals Number of decimal places (default = 2)
 * @returns Formatted change as a string
 */
export const changeFormat = (value: number | null, decimals = 2) => {
  if (value === null) return "-";
  return (value < 0) ? value.toFixed(decimals).toString() : "+" + value.toFixed(decimals);
}

/**
 * Dayjs parser helper function.
 * 
 * @param date Date string in the format "DD/MM/YYYY hh:mm A"
 * @returns dayjs object
 */
export const dayjsDate = (date: string) => dayjs(date, "DD/MM/YYYY hh:mm A");