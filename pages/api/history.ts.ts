import { NextApiRequest, NextApiResponse } from 'next'
import { getKLines } from '../../app/lib/binance-api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { pair, interval = '1h', limit = '100' } = req.query
    
    if (!pair || typeof pair !== 'string') {
      return res.status(400).json({ error: 'Pair parameter is required' })
    }

    const klines = await getKLines(
      pair,
      interval as string,
      parseInt(limit as string)
    )

    res.status(200).json({
      success: true,
      pair,
      interval,
      data: klines,
      count: klines.length,
      from: new Date(klines[0]?.timestamp || Date.now()).toISOString(),
      to: new Date(klines[klines.length - 1]?.timestamp || Date.now()).toISOString()
    })
  } catch (error) {
    console.error('History API error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}