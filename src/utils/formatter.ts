import * as currency from "currency.js";

export function formatCurrency(price: number): string {
  return currency(price).format();
}

export function formatDecimalTwoPrecision(num: number): string {
  return currency(num, { precision: 2 }).toString();
}

export default {
  formatCurrency,
  formatDecimalTwoPrecision,
};
