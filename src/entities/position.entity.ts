import Stock from "./stock.entity";

export default class Position {
  constructor(private readonly _stock: Stock, private _quantity: number) {}

  getPositionValue(): number {
    return this._stock.getCurrentPrice() * this._quantity;
  }

  getStock(): Stock {
    return this._stock;
  }

  getQuantity(): number {
    return this._quantity;
  }

  buy(quantity: number): void {
    this._quantity += quantity;
  }

  sell(quantity: number): void {
    this._quantity -= quantity;
  }
}