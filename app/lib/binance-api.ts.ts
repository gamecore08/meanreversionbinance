import axios from 'axios'
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 60 * 1000 // 1 minute cache
})

const BINANCE_API = 'https://api.binance.com/api/v3'

export interface KlineData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export async function getKLines(
  symbol: string,
  interval: string = '1h',
  limit: number = 100
): Promise<KlineData[]> {
  const cacheKey = `${symbol}_${interval}_${limit}`
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  try {
    const response = await axios.get(`${BINANCE_API}/klines`, {
      params: {
        symbol: symbol.replace('/', ''),
        interval,
        limit
      }
    })

    const klines = response.data.map((k: any[]) => ({
      timestamp: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }))

    cache.set(cacheKey, klines)
    return klines
  } catch (error) {
    console.error(`Error fetching klines for ${symbol}:`, error)
    throw error
  }
}

export async function get24hrTicker(symbol: string) {
  try {
    const response = await axios.get(`${BINANCE_API}/ticker/24hr`, {
      params: { symbol: symbol.replace('/', '') }
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching ticker for ${symbol}:`, error)
    return null
  }
}

export async function getAllUSDTPairs(): Promise<string[]> {
  try {
    const response = await axios.get(`${BINANCE_API}/exchangeInfo`)
    const symbols = response.data.symbols
      .filter((s: any) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
      .map((s: any) => s.symbol)
    return symbols
  } catch (error) {
    console.error('Error fetching USDT pairs:', error)
    return []
  }
}

export async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    const response = await axios.get(`${BINANCE_API}/ticker/price`, {
      params: { symbol: symbol.replace('/', '') }
    })
    return parseFloat(response.data.price)
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return 0
  }
}