export interface KlineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CorrelatedPair {
  pair: string;
  correlation: number;
  currentPrice: number;
  btcPrice: number;
  spread: number;
  zScore: number;
  meanSpread: number;
  stdSpread: number;
  lastUpdate: Date;
  volume24h?: number;
  priceChange24h?: number;
}

export interface TradingSignal {
  pair: string;
  signal: 'STRONG BUY' | 'STRONG SELL' | 'WEAK BUY' | 'WEAK SELL' | 'NEUTRAL';
  confidence: number;
  zScore: number;
  correlation: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  hedgeRatio: number;
  action: 'TRADE' | 'WATCH' | 'IGNORE';
  timestamp: Date;
}

export interface ScannerConfig {
  minCorrelation: number;
  timeframe: string;
  zScoreThreshold: number;
  updateInterval: number;
  maxPairsToScan: number;
}