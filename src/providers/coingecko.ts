import * as vscode from "vscode";
import * as path from "path";
import fetcher from "../utils/fetcher";
import formatCurrency from "../utils/formatter";
import { ResponseCoinGeckoItem } from "../entities/response";

export class CoinGeckoProvider implements vscode.TreeDataProvider<CoinItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    CoinItem | undefined | null | void
  > = new vscode.EventEmitter<CoinItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CoinItem | undefined | null | void
  > = this._onDidChangeTreeData.event;
  private extensionName: string = "Cointy";

  async getCoins(): Promise<CoinItem[]> {
    try {
      const response = await fetcher({
        url:
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
      });
      return response.map((coin: ResponseCoinGeckoItem) => this.setCoin(coin));
    } catch (err) {
      vscode.window.showErrorMessage(
        `${this.extensionName}: Error fetching coingecko`
      );
    }
    return [];
  }

  setCoin(coin: ResponseCoinGeckoItem): CoinItem {
    return new CoinItem(
      `${coin.name} (${coin.symbol.toUpperCase()})`,
      vscode.Uri.parse(coin.image),
      formatCurrency(coin.current_price),
      this.setCoinDetail(coin)
    );
  }

  setCoinDetail(coin: ResponseCoinGeckoItem): CoinItem[] {
    return [
      new CoinItem(
        "Price Change(24h):",
        this.setIconPathPriceChange(coin.price_change_percentage_24h),
        `${coin.price_change_percentage_24h}%`
      ),
      new CoinItem(
        "Market Cap Change(24h):",
        this.setIconPathPriceChange(coin.market_cap_change_percentage_24h),
        `${coin.market_cap_change_percentage_24h}%`
      ),
      new CoinItem(
        `Volume(24h):`,
        path.join(__filename, "..", "..", "resources", "volume.svg"),
        formatCurrency(coin.total_volume)
      ),
      new CoinItem(
        `Market Cap:`,
        path.join(__filename, "..", "..", "resources", "market.svg"),
        formatCurrency(coin.market_cap)
      ),
    ];
  }

  setIconPathPriceChange(price: number): string {
    return price >= 0
      ? path.join(__filename, "..", "..", "resources", "up.svg")
      : path.join(__filename, "..", "..", "resources", "down.svg");
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
