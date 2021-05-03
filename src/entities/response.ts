/* eslint-disable @typescript-eslint/naming-convention */
export interface ResponseCoinGeckoItem {
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

export interface ResponseCoinMarketCapItem {
  name: string;
  symbol: string;
  quote: Quote;
}
export interface Quote {
  USD: USD;
}
export interface USD {
  price: number;
  volume_24h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
}
