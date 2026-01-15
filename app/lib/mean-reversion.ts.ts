export function calculateSpread(price1: number, price2: number): number {
  return (price1 / price2) - 1;
}

export function calculateZScore(
  currentSpread: number,
  meanSpread: number,
  stdSpread: number
): number {
  if (stdSpread === 0) return 0;
  return (currentSpread - meanSpread) / stdSpread;
}

export function calculateHedgeRatio(
  price1: number,
  price2: number,
  volatility1: number,
  volatility2: number
): number {
  return (price2 * volatility2) / (price1 * volatility1);
}

export function calculateReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

export function calculateVolatility(returns: number[]): number {
  const mean = returns.reduce((a, b) => a + b) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(365); // Annualized
}

export function generateTradingLevels(
  currentPrice: number,
  zScore: number,
  volatility: number
) {
  const isOverbought = zScore > 0;
  const targetPercent = Math.min(0.03, Math.abs(zScore) * 0.01);
  const stopPercent = targetPercent * 1.5;
  
  return {
    entry: currentPrice,
    target: isOverbought 
      ? currentPrice * (1 - targetPercent)
      : currentPrice * (1 + targetPercent),
    stopLoss: isOverbought
      ? currentPrice * (1 + stopPercent)
      : currentPrice * (1 - stopPercent),
    riskRewardRatio: targetPercent / stopPercent
  };
}