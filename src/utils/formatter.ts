import * as currency from "currency.js";

export default function formatCurrency(price: number): string {
  return currency(price).format();
}
