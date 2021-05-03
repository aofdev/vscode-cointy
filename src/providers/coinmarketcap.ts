import * as vscode from "vscode";
import fetcher from "../utils/fetcher";
import formatCurrency from "../utils/formatter";
import { ResponseCoinMarketCapItem } from "../entities/response";

export class CoinMarketCapProvider
  implements vscode.TreeDataProvider<CoinItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    CoinItem | undefined | null | void
  > = new vscode.EventEmitter<CoinItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CoinItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private apiKey: string | undefined;
  private extensionID: string = "cointy";
  private extensionName: string = "Cointy";

  // get the apiKey definitions from the configuration
  constructor() {
    this.apiKey = vscode.workspace
      .getConfiguration(this.extensionID)
      .get("coinmarketcap.apiKey");
    vscode.workspace.onDidChangeConfiguration(() => {
      this.apiKey = vscode.workspace
        .getConfiguration(this.extensionID)
        .get("coinmarketcap.apiKey");
    });
    console.log(this.apiKey);
    if (typeof this.apiKey === "undefined" || this.apiKey === "") {
      vscode.window
        .showInformationMessage(
          `${this.extensionName}: Please enter your apiKey coinMarketCap`,
          "Add API Key"
        )
        .then((selection) => {
          if (selection) {
            vscode.commands.executeCommand(
              "workbench.action.openSettings",
              `@ext:${this.extensionID}`
            );
          }
        });
    } else {
      this.refresh();
    }
  }

  async getCoins(): Promise<CoinItem[]> {
    try {
      const response = await fetcher({
        url:
          "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=100&convert=USD",
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "X-CMC_PRO_API_KEY": this.apiKey,
        },
      });
      return response.data.map((coin: ResponseCoinMarketCapItem) =>
        this.setCoin(coin)
      );
    } catch (err) {
      vscode.window.showErrorMessage(
        `${this.extensionName}: Error fetching coinmarketcap`
      );
    }
    return [];
  }

  setCoin(coin: ResponseCoinMarketCapItem): CoinItem {
    return new CoinItem(
      `${coin.name} (${coin.symbol})`,
      this.setIconPathPriceChange(coin.quote.USD.percent_change_24h),
      formatCurrency(coin.quote.USD.price),
      this.setCoinDetail(coin)
    );
  }

  setCoinDetail(coin: ResponseCoinMarketCapItem): CoinItem[] {
    return [
      new CoinItem(
        "Price Change(24h):",
        this.setIconPathPriceChange(coin.quote.USD.percent_change_24h),
        `${coin.quote.USD.percent_change_24h}%`
      ),
      new CoinItem(
        "Price Change(7d):",
        this.setIconPathPriceChange(coin.quote.USD.percent_change_7d),
        `${coin.quote.USD.percent_change_7d}%`
      ),
      new CoinItem(
        `Volume(24h):`,
        "./resources/volume.svg",
        formatCurrency(coin.quote.USD.volume_24h)
      ),
      new CoinItem(
        `Market Cap:`,
        "./resources/market.svg",
        formatCurrency(coin.quote.USD.market_cap)
      ),
    ];
  }

  setIconPathPriceChange(price: number): string {
    return price >= 0 ? "./resources/up.svg" : "./resources/down.svg";
  }

  getTreeItem(element: CoinItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: CoinItem | undefined
  ): vscode.ProviderResult<CoinItem[]> {
    if (element === undefined) {
      return Promise.resolve(this.getCoins());
    }

    return element.children;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class CoinItem extends vscode.TreeItem {
  children: CoinItem[] | undefined;

  constructor(
    label: string,
    iconPath: vscode.Uri | string,
    price: string,
    children?: CoinItem[]
  ) {
    super(
      label,
      children === undefined
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed
    );
    this.children = children;
    this.iconPath = iconPath;
    this.description = price;
  }
}
