import Portfolio from "../entities/portfolio.entity";
import Position from "../entities/position.entity";

export default function displayAllocations(portfolio: Portfolio): void {
  const positions = portfolio.getPositions();
  const stocksValue = positions.reduce((sum: number, pos: Position) =>
    sum + pos.getPositionValue(), 0
  );
  const cashAvailable = portfolio.getCashDrag();
  const totalValue = stocksValue + cashAvailable;

  console.log('\n📊 Current Allocations:');
  console.log('─'.repeat(60));
  positions.forEach((position: Position) => {
    const stock = position.getStock();
    const value = position.getPositionValue();
    const allocation = (value / stocksValue) * 100;
    console.log(
      `${stock.getSymbol().padEnd(6)} | ` +
      `${position.getQuantity().toString().padStart(4)} shares @ ` +
      `$${stock.getCurrentPrice().toFixed(2).padStart(6)} = ` +
      `$${value.toFixed(2).padStart(9)} | ` +
      `${allocation.toFixed(2).padStart(5)}%`
    );
  });
  console.log('─'.repeat(60));
  console.log(`Stocks Value:   $${stocksValue.toFixed(2)}`);
  console.log(`Cash Available: $${cashAvailable.toFixed(2)}`);
  console.log(`Total Value:    $${totalValue.toFixed(2)}\n`);
}