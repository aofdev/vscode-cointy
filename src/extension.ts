import * as vscode from "vscode";
import { CoinGeckoProvider } from "./providers/coingecko";
import { CoinMarketCapProvider } from "./providers/coinmarketcap";

export function activate() {
  const coinGeckoProvider = new CoinGeckoProvider();
  const coinMarketCapProvider = new CoinMarketCapProvider();
  vscode.window.registerTreeDataProvider(
    "coinGeckoTreeView",
    coinGeckoProvider
  );
  vscode.window.registerTreeDataProvider(
    "coinMarketCapTreeView",
    coinMarketCapProvider
  );
  vscode.commands.registerCommand("coinGeckoTreeView.refreshEntry", () =>
    coinGeckoProvider.refresh()
  );
  vscode.commands.registerCommand("coinMarketCapTreeView.refreshEntry", () =>
    coinMarketCapProvider.refresh()
  );
}

export function deactivate() {}
