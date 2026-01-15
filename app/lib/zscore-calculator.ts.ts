import { mean, std, median } from 'mathjs';

export class ZScoreCalculator {
  private spreads: number[] = [];
  private maxHistory: number = 100;
  
  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory;
  }
  
  addSpread(spread: number): void {
    this.spreads.push(spread);
    if (this.spreads.length > this.maxHistory) {
      this.spreads.shift();
    }
  }
  
  getCurrentZScore(spread: number): number {
    if (this.spreads.length < 20) return 0;
    
    const meanValue = mean(this.spreads) as number;
    const stdValue = std(this.spreads) as number;
    
    if (stdValue === 0) return 0;
    return (spread - meanValue) / stdValue;
  }
  
  getStatistics() {
    if (this.spreads.length === 0) {
      return { mean: 0, std: 0, median: 0, count: 0 };
    }
    
    return {
      mean: mean(this.spreads) as number,
      std: std(this.spreads) as number,
      median: median(this.spreads) as number,
      count: this.spreads.length,
      min: Math.min(...this.spreads),
      max: Math.max(...this.spreads)
    };
  }
  
  isSignal(zScore: number, threshold: number = 2.0): {
    isSignal: boolean;
    type: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
    strength: number;
  } {
    const absZ = Math.abs(zScore);
    
    return {
      isSignal: absZ >= threshold,
      type: zScore >= threshold ? 'OVERBOUGHT' : 
            zScore <= -threshold ? 'OVERSOLD' : 'NEUTRAL',
      strength: Math.min(1, absZ / 3)
    };
  }
  
  clear(): void {
    this.spreads = [];
  }
}