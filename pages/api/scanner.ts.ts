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
    const { threshold = '0.7', timeframe = '1h' } = req.query
    
    const scanResults = await scanCorrelatedPairs(
      'BTCUSDT',
      parseFloat(threshold as string),
      timeframe as string
    )
    
    const signals = await getMeanReversionSignals(scanResults.correlatedPairs)
    
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      scanResults,
      signals,
      metadata: {
        basePair: 'BTC/USDT',
        minCorrelation: parseFloat(threshold as string),
        timeframe,
        totalPairsScanned: scanResults.totalPairs
      }
    })
  } catch (error) {
    console.error('Scanner API error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to scan pairs',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}