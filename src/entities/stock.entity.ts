export default class Stock {
  private _currentPrice: number = 0;
  private _symbol: string;

  constructor(symbol: string, price?: number) {
    this._symbol = symbol;
    if (price) {
      this._currentPrice = price;
    }
  }

  getSymbol(): string {
    return this._symbol;
  }

  currentPrice(price: number): void {
    this._currentPrice = price;
  }

  getCurrentPrice(): number {
    return this._currentPrice;
  }
}