import * as vscode from "vscode";
import { CoinGeckoProvider } from "./providers/coingecko";
import { CoinMarketCapProvider } from "./providers/coinmarketcap";

const extensionName: string = "Cointy";
const extensionID: string = "aofdev.cointy";

let coinMarketCapDisposable: vscode.Disposable | undefined;
let currentCoinMarketCapProvider: CoinMarketCapProvider | undefined;

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

  // Register refresh command once, using current provider
  vscode.commands.registerCommand("coinMarketCapTreeView.refreshEntry", () =>
    currentCoinMarketCapProvider?.refresh()
  );
}

export function constructCoinMarketCapOnChange() {
  const apiKey: string | undefined = vscode.workspace
    .getConfiguration("cointy")
    .get("coinmarketcap.apiKey");

  // Dispose old provider if exists
  if (coinMarketCapDisposable) {
    coinMarketCapDisposable.dispose();
  }

  const coinMarketCapProvider = new CoinMarketCapProvider(
    extensionID,
    extensionName,
    apiKey
  );

  currentCoinMarketCapProvider = coinMarketCapProvider;

  coinMarketCapDisposable = vscode.window.registerTreeDataProvider(
    "coinMarketCapTreeView",
    coinMarketCapProvider
  );
}

export function deactivate() {}
