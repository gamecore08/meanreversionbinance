import { NextApiRequest, NextApiResponse } from 'next'
import { scanCorrelatedPairs, getMeanReversionSignals } from '../../app/lib/correlation-scanner'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      threshold = '0.7', 
      timeframe = '1h',
      limit = '20'
    } = req.query
    
    console.log('Fetching signals with params:', { threshold, timeframe, limit })
    
    const scanResults = await scanCorrelatedPairs(
      'BTCUSDT',
      parseFloat(threshold as string),
      timeframe as string
    )
    
    const allSignals = await getMeanReversionSignals(scanResults.correlatedPairs)
    
    // Filter and sort signals
    const filteredSignals = allSignals
      .filter(signal => Math.abs(signal.zScore) >= 1.5)
      .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))
      .slice(0, parseInt(limit as string))
    
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      signals: filteredSignals,
      metadata: {
        totalScanned: scanResults.totalPairs,
        correlatedFound: scanResults.correlatedPairs.length,
        signalsFound: filteredSignals.length,
        basePair: 'BTC/USDT',
        minCorrelation: parseFloat(threshold as string),
        timeframe
      }
    })
  } catch (error) {
    console.error('Signals API error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate trading signals',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}