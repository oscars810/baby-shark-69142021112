import Position from './position.entity';
import Stock  from './stock.entity';

export type Order = {
  stock: Stock;
  quantity: number;
  action: 'BUY' | 'SELL';
};

type PendingOrder = {
  position: Position;
  quantity: number;
  action: 'BUY' | 'SELL';
  allocationDifference: number;
};

export default class Portfolio {
  private _positions: Position[] = [];
  private _targetAllocations: Map<string, number> = new Map();
  private _allocationThreshold: number = 0.03;
  private _cashDrag: number = 0;

  constructor(public readonly name: string, cash: number) {
    this._cashDrag = cash;
  }

  getPositions(): Position[] {
    return this._positions;
  }

  getCashDrag(): number {
    return this._cashDrag;
  }

  addPosition(stock: Stock, quantity: number): void {
    this._cashDrag -= stock.getCurrentPrice() * quantity;
    this._positions.push(new Position(stock, quantity));
  }

  setTargetAllocations(allocations: Map<string, number>): void {
    const total = Array.from(allocations.values()).reduce((sum, val) => sum + val, 0);

    if (Math.abs(total - 1.0) > 0.001) {
      throw new Error(`Allocations must sum to 1.0 (100%), got ${total.toFixed(2)}`);
    }

    this._targetAllocations = allocations;
  }

  rebalance(): Order[] {
    const portfolioValue = this.calculatePortfolioValue();
    const currentAllocations = this.calculateCurrentAllocations();

    const pendingOrders: PendingOrder[] = [];

    for (const [symbol, stockAllocation] of currentAllocations.entries()) {
      const targetAllocation = this._targetAllocations.get(symbol);
      if (!targetAllocation) {
        throw new Error(`Target allocation for stock ${symbol} not found`);
      }
      const position = this._positions.find((position) => position.getStock().getSymbol() === symbol);
      if (!position) {
        throw new Error(`Stock ${symbol} not found in portfolio`);
      }

      const stockPrice = position.getStock().getCurrentPrice();
      const allocationDifference = stockAllocation - targetAllocation;
      const moneyDifference = allocationDifference * portfolioValue;

      if (allocationDifference > this._allocationThreshold) {
        const quantityToSell = Math.floor(moneyDifference / stockPrice);
        pendingOrders.push({
          position,
          quantity: quantityToSell,
          action: 'SELL',
          allocationDifference: Math.abs(allocationDifference)
        });
      } else if (allocationDifference < -this._allocationThreshold) {
        const quantityToBuy = Math.floor(Math.abs(moneyDifference) / stockPrice);
        pendingOrders.push({
          position,
          quantity: quantityToBuy,
          action: 'BUY',
          allocationDifference: Math.abs(allocationDifference)
        });
      }
    }

    const orders = this.executeOrders(pendingOrders);

    return orders;
  }

  private executeOrders(pendingOrders: PendingOrder[]): Order[] {
    const orders: Order[] = [];

    const pendingSells = pendingOrders.filter((order) => order.action === 'SELL');
    for (const pendingSell of pendingSells) {
      const { position, quantity } = pendingSell;
      const stock = position.getStock();
      const stockPrice = stock.getCurrentPrice();

      orders.push({
        stock,
        quantity,
        action: 'SELL'
      });
      position.sell(quantity);
      this._cashDrag += stockPrice * quantity;
    }

    const pendingBuys = pendingOrders.filter((order) => order.action === 'BUY');
    pendingBuys.sort((a, b) => b.allocationDifference - a.allocationDifference);

    for (const pendingBuy of pendingBuys) {
      const { position, quantity } = pendingBuy;
      const stock = position.getStock();
      const stockPrice = stock.getCurrentPrice();
      const maxQuantityToBuy = Math.floor(this._cashDrag / stockPrice);

      const quantityToBuy = Math.min(quantity, maxQuantityToBuy);

      if (quantityToBuy > 0) {
        orders.push({
          stock,
          quantity: quantityToBuy,
          action: 'BUY'
        });
        position.buy(quantityToBuy);
        this._cashDrag -= stockPrice * quantityToBuy;
      }
    }

    return orders;
  }

  private calculatePortfolioValue(): number {
    return this._positions.reduce((acc, position) => acc + position.getPositionValue(), 0);
  }

  private calculateCurrentAllocations(): Map<string, number> {
    const portfolioValue = this.calculatePortfolioValue();
    return this._positions.reduce((acc, position) => {
      const stock = position.getStock();
      const stockSymbol = stock.getSymbol();
      const positionValue = position.getPositionValue();

      acc.set(stockSymbol, positionValue / portfolioValue);

      return acc;
    }, new Map<string, number>());
  }
}