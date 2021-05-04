import * as vscode from "vscode";
import * as path from "path";
import fetcher from "../utils/fetcher";
import * as formatter from "../utils/formatter";
import { ResponseCoinMarketCapItem } from "../entities/response";
export class CoinMarketCapProvider
  implements vscode.TreeDataProvider<CoinItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    CoinItem | undefined | null | void
  > = new vscode.EventEmitter<CoinItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CoinItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private extensionName: string;
  private apiKey: string | undefined;

  constructor(
    extensionID: string,
    extensionName: string,
    apiKey: string | undefined
  ) {
    this.extensionName = extensionName;
    this.apiKey = apiKey;

    if (this.checkApiKey()) {
      vscode.window
        .showInformationMessage(
          `${extensionName}: Please enter your CoinMarketCap API Key `,
          "Add API Key"
        )
        .then((selection) => {
          if (selection) {
            vscode.commands.executeCommand(
              "workbench.action.openSettings",
              `@ext:${extensionID}`
            );
          }
        });
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
        `${this.extensionName}: Error fetching CoinMarketCap API`
      );
    }
    return [];
  }

  setCoin(coin: ResponseCoinMarketCapItem): CoinItem {
    return new CoinItem(
      `${coin.name} (${coin.symbol})`,
      this.setIconPathPriceChange(coin.quote.USD.percent_change_24h),
      formatter.formatCurrency(coin.quote.USD.price),
      this.setCoinDetail(coin)
    );
  }

  setCoinDetail(coin: ResponseCoinMarketCapItem): CoinItem[] {
    return [
      new CoinItem(
        "Price Change(24h):",
        this.setIconPathPriceChange(coin.quote.USD.percent_change_24h),
        `${formatter.formatDecimalTwoPrecision(
          coin.quote.USD.percent_change_24h
        )}%`
      ),
      new CoinItem(
        "Price Change(7d):",
        this.setIconPathPriceChange(coin.quote.USD.percent_change_7d),
        `${formatter.formatDecimalTwoPrecision(
          coin.quote.USD.percent_change_7d
        )}%`
      ),
      new CoinItem(
        `Volume(24h):`,
        this.setIconPath("volume.svg"),
        formatter.formatCurrency(coin.quote.USD.volume_24h)
      ),
      new CoinItem(
        `Market Cap:`,
        this.setIconPath("market.svg"),
        formatter.formatCurrency(coin.quote.USD.market_cap)
      ),
    ];
  }

  setIconPathPriceChange(price: number): string {
    return price >= 0
      ? this.setIconPath("up.svg")
      : this.setIconPath("down.svg");
  }

  setIconPath(iconName: string): string {
    return path.join(__filename, "..", "..", "..", "resources", iconName);
  }

  getTreeItem(element: CoinItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: CoinItem | undefined
  ): vscode.ProviderResult<CoinItem[]> {
    if (this.checkApiKey()) {
      return Promise.resolve([]);
    } else if (element === undefined) {
      return Promise.resolve(this.getCoins());
    }

    return element.children;
  }

  checkApiKey(): boolean {
    return typeof this.apiKey === "undefined" || this.apiKey === "";
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
