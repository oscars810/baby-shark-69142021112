import { Order } from "../entities/portfolio.entity";

export default function displayOrders(orders: Order[]): void {
  console.log('\n📋 Rebalancing Orders:');
  console.log('─'.repeat(60));
  if (orders.length === 0) {
    console.log('No rebalancing needed - portfolio is within threshold');
  } else {
    orders.forEach((order) => {
      const actionSymbol = order.action === 'BUY' ? '📈' : '📉';
      console.log(
        `${actionSymbol} ${order.action.padEnd(4)} ${order.quantity.toString().padStart(4)} shares of ${order.stock.getSymbol()}`
      );
    });
  }
  console.log('─'.repeat(60) + '\n');
}