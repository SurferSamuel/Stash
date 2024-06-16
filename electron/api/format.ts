import dayjs from "dayjs";

// Currency formatter helper function
// Examples: 
//    12.3  -> "$12.30"
//   -12.3  -> "-$12.30"
export const currencyFormat = (value: number | null, decimals = 2) => {
  if (value === null) return "-";
  return Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: decimals,
  }).format(value);
};

// Percentage formatter helper function
// Examples: 
//    12.3  -> "12.30%"
//   -12.3  -> "-$12.30%"
export const precentFormat = (value: number | null, decimals = 2) => {
  if (value === null) return "-";
  return value.toFixed(decimals) + "%";
}

// Change formatter helper function
// Examples: 
//    12.3  -> "+12.30"
//   -12.3  -> "-12.30"
export const changeFormat = (value: number | null, decimals = 2) => {
  if (value === null) return "-";
  return (value < 0) ? value.toFixed(decimals).toString() : "+" + value.toFixed(decimals);
}

// Dayjs parser helper function
// Converts a date string to a dayjs object
export const dayjsDate = (date: string) => dayjs(date, "DD/MM/YYYY hh:mm A");