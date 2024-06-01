import dayjs from "dayjs";

// Currency formatter helper function
// Examples: 
//    12.3  -> "$12.30"
//   -12.3  -> "-$12.30"
export const currencyFormat = (value: number | null, digits = 2) => {
  if (value === null) return "-";
  return Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: digits,
  }).format(value);
};

// Percentage formatter helper function
// Examples: 
//    12.3  -> "12.30%"
//   -12.3  -> "-$12.30%"
export const precentFormat = (value: number | null, digits = 2) => {
  if (value === null) return "-";
  return value.toFixed(digits) + "%";
}

// Change formatter helper function
// Examples: 
//    12.3  -> "+12.30"
//   -12.3  -> "-12.30"
export const changeFormat = (value: number | null, digits = 2) => {
  if (value === null) return "-";
  return (value < 0) ? value.toFixed(digits).toString() : "+" + value.toFixed(digits);
}

// Dayjs parser helper function
// Converts a date string to a dayjs object
export const dayjsDate = (date: string) => dayjs(date, "DD/MM/YYYY hh:mm A");