import { getKLines, getAllUSDTPairs, getCurrentPrice } from './binance-api'
import { calculateCorrelation, calculateZScore, calculateSpread } from './mean-reversion'
import { mean, std } from 'mathjs'

export interface CorrelatedPair {
  pair: string
  correlation: number
  currentPrice: number
  btcPrice: number
  spread: number
  zScore: number
  meanSpread: number
  stdSpread: number
  lastUpdate: Date
}

export async function scanCorrelatedPairs(
  basePair: string = 'BTCUSDT',
  minCorrelation: number = 0.7,
  interval: string = '1h'
): Promise<{
  correlatedPairs: CorrelatedPair[]
  scanTime: Date
  totalPairs: number
}> {
  console.log(`Starting correlation scan with BTC/USDT (min correlation: ${minCorrelation})...`)
  
  // Get all USDT pairs
  const allPairs = await getAllUSDTPairs()
  const btcData = await getKLines(basePair, interval, 100)
  
  if (btcData.length === 0) {
    throw new Error('Failed to fetch BTC data')
  }
  
  const btcPrices = btcData.map(d => d.close)
  const correlatedPairs: CorrelatedPair[] = []
  
  // Scan top 50 pairs for performance (can be increased)
  const pairsToScan = allPairs
    .filter(p => p !== basePair)
    .slice(0, 50)
  
  for (const pair of pairsToScan) {
    try {
      const pairData = await getKLines(pair, interval, 100)
      
      if (pairData.length === btcPrices.length) {
        const pairPrices = pairData.map(d => d.close)
        const correlation = calculateCorrelation(btcPrices, pairPrices)
        
        if (Math.abs(correlation) >= minCorrelation) {
          const currentPrice = await getCurrentPrice(pair)
          const currentBtcPrice = btcPrices[btcPrices.length - 1]
          
          // Calculate spread history
          const spreads = btcPrices.map((btcPrice, i) => 
            calculateSpread(btcPrice, pairPrices[i])
          )
          
          const meanSpread = mean(spreads) as number
          const stdSpread = std(spreads) as number
          const currentSpread = calculateSpread(currentBtcPrice, currentPrice)
          const zScore = (currentSpread - meanSpread) / stdSpread
          
          correlatedPairs.push({
            pair,
            correlation,
            currentPrice,
            btcPrice: currentBtcPrice,
            spread: currentSpread,
            zScore,
            meanSpread,
            stdSpread,
            lastUpdate: new Date()
          })
        }
      }
    } catch (error) {
      console.warn(`Error scanning pair ${pair}:`, error)
      continue
    }
  }
  
  // Sort by absolute correlation (highest first)
  correlatedPairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
  
  return {
    correlatedPairs,
    scanTime: new Date(),
    totalPairs: allPairs.length
  }
}

export async function getMeanReversionSignals(
  correlatedPairs: CorrelatedPair[]
): Promise<any[]> {
  const signals = correlatedPairs.map(pair => {
    const signalStrength = Math.abs(pair.zScore)
    const confidence = Math.min(95, Math.max(60, signalStrength * 30))
    
    return {
      ...pair,
      signal: pair.zScore > 2.0 ? 'STRONG SELL' : 
               pair.zScore < -2.0 ? 'STRONG BUY' : 
               pair.zScore > 1.0 ? 'WEAK SELL' : 
               pair.zScore < -1.0 ? 'WEAK BUY' : 'NEUTRAL',
      confidence,
      action: Math.abs(pair.zScore) > 2.0 ? 'TRADE' : 
              Math.abs(pair.zScore) > 1.5 ? 'WATCH' : 'IGNORE',
      hedgeRatio: 1 / (pair.currentPrice / pair.btcPrice),
      targetPrice: pair.currentPrice * (1 - (pair.zScore > 0 ? 0.01 : -0.01)),
      stopLoss: pair.currentPrice * (1 + (pair.zScore > 0 ? 0.02 : -0.02))
    }
  })
  
  return signals
}

function calculateCorrelation(array1: number[], array2: number[]): number {
  const n = array1.length
  const mean1 = array1.reduce((a, b) => a + b) / n
  const mean2 = array2.reduce((a, b) => a + b) / n
  
  let numerator = 0
  let denom1 = 0
  let denom2 = 0
  
  for (let i = 0; i < n; i++) {
    const diff1 = array1[i] - mean1
    const diff2 = array2[i] - mean2
    numerator += diff1 * diff2
    denom1 += diff1 * diff1
    denom2 += diff2 * diff2
  }
  
  return numerator / Math.sqrt(denom1 * denom2)
}