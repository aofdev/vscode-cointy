import * as vscode from "vscode";
import { CoinGeckoProvider } from "./providers/coingecko";
import { CoinMarketCapProvider } from "./providers/coinmarketcap";

const extensionName: string = "Cointy";
const extensionID: string = "aofdev.cointy";

export function activate(context: vscode.ExtensionContext) {
  const coinGeckoProvider = new CoinGeckoProvider(extensionName);

  vscode.window.registerTreeDataProvider(
    "coinGeckoTreeView",
    coinGeckoProvider
  );

  vscode.commands.registerCommand("coinGeckoTreeView.refreshEntry", () =>
    coinGeckoProvider.refresh()
  );

  // call once constructCoinMarketCapOnChange
  constructCoinMarketCapOnChange();

  // call the constructor again if the configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(constructCoinMarketCapOnChange)
  );
}

export function constructCoinMarketCapOnChange() {
  const apiKey: string | undefined = vscode.workspace
    .getConfiguration("cointy")
    .get("coinmarketcap.apiKey");

  const coinMarketCapProvider = new CoinMarketCapProvider(
    extensionID,
    extensionName,
    apiKey
  );

  vscode.window.registerTreeDataProvider(
    "coinMarketCapTreeView",
    coinMarketCapProvider
  );

  vscode.commands.registerCommand("coinMarketCapTreeView.refreshEntry", () =>
    coinMarketCapProvider.refresh()
  );
}

export function deactivate() {}
