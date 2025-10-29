import Portfolio from './src/entities/portfolio.entity';
import Stock from './src/entities/stock.entity';
import displayAllocations from './src/utils/display-allocations.utils';
import displayOrders from './src/utils/display-orders.utils';

function main(): void {
  console.log('\n🎯 Portfolio Rebalancing Example with Cash Management\n');
  console.log('═'.repeat(60));

  // Step 1: Create stocks with initial prices
  console.log('\n📍 Step 1: Initialize Stocks');
  const appleStock = new Stock('AAPL', 150);
  const metaStock = new Stock('META', 300);
  const fintualStock = new Stock('FNTL', 100);

  console.log(`  AAPL: $${appleStock.getCurrentPrice()}`);
  console.log(`  META: $${metaStock.getCurrentPrice()}`);
  console.log(`  FNTL: $${fintualStock.getCurrentPrice()}`);

  // Step 2: Create portfolio with initial cash
  console.log('\n📍 Step 2: Create Portfolio with Initial Cash');
  const initialCash = 10000;
  const portfolio = new Portfolio('My Investment Portfolio', initialCash);
  console.log(`  Starting with $${initialCash.toFixed(2)} in cash`);

  const targetAllocations = new Map<string, number>();
  targetAllocations.set('AAPL', 0.50);
  targetAllocations.set('META', 0.20);
  targetAllocations.set('FNTL', 0.30);
  portfolio.setTargetAllocations(targetAllocations);
  console.log('  Target allocations: 50% AAPL, 20% META, 30% FNTL');

  // Step 3: Add initial positions to match target allocations
  console.log('\n📍 Step 3: Purchase Initial Positions');
  const initialValue = 10000;
  const appleShares = Math.floor((initialValue * 0.50) / appleStock.getCurrentPrice());
  const metaShares = Math.floor((initialValue * 0.20) / metaStock.getCurrentPrice());
  const fintualShares = Math.floor((initialValue * 0.30) / fintualStock.getCurrentPrice());

  console.log(`  Buying ${appleShares} AAPL shares`);
  console.log(`  Buying ${metaShares} META shares`);
  console.log(`  Buying ${fintualShares} FNTL shares`);

  portfolio.addPosition(appleStock, appleShares);
  portfolio.addPosition(metaStock, metaShares);
  portfolio.addPosition(fintualStock, fintualShares);

  console.log('\n📍 Step 4: Initial Portfolio State');
  displayAllocations(portfolio);

  // Step 5: Simulate price changes
  console.log('📍 Step 5: Stock Prices Change');
  console.log('─'.repeat(60));

  const appleNewPrice = 180;   // +20%
  const metaNewPrice = 270;    // -10%
  const fintualNewPrice = 110;  // +10%

  console.log(`  AAPL: $${appleStock.getCurrentPrice()} → $${appleNewPrice} (+20%)`);
  console.log(`  META: $${metaStock.getCurrentPrice()} → $${metaNewPrice} (-10%)`);
  console.log(`  FNTL: $${fintualStock.getCurrentPrice()} → $${fintualNewPrice} (+10%)`);

  appleStock.currentPrice(appleNewPrice);
  metaStock.currentPrice(metaNewPrice);
  fintualStock.currentPrice(fintualNewPrice);

  // Step 6: Show allocation drift
  console.log('\n📍 Step 6: Allocations After Price Changes (Drift Detected)');
  displayAllocations(portfolio);

  // Step 7: Rebalance portfolio
  console.log('📍 Step 7: Rebalance Portfolio');
  console.log('  Note: SELL orders execute first (freeing up cash)');
  console.log('        Then BUY orders execute (limited by available cash)');
  const orders = portfolio.rebalance();
  displayOrders(orders);

  // Step 8: Show final state
  console.log('📍 Step 8: Portfolio After Rebalancing');
  displayAllocations(portfolio);

  console.log('═'.repeat(60));
  console.log('✅ Rebalancing Complete!\n');
}

main();
