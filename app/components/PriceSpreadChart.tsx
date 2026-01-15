'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'
import { TrendingUp, TrendingDown, Maximize2 } from 'lucide-react'

interface PriceSpreadChartProps {
  pair: string
  btcData: any[]
  pairData: any[]
}

export default function PriceSpreadChart({ pair, btcData, pairData }: PriceSpreadChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [showSpread, setShowSpread] = useState(true)
  const [normalized, setNormalized] = useState(true)
  
  useEffect(() => {
    if (btcData.length > 0 && pairData.length > 0) {
      const minLength = Math.min(btcData.length, pairData.length)
      const data = []
      
      for (let i = 0; i < minLength; i++) {
        const btcPrice = btcData[i].close
        const pairPrice = pairData[i].close
        const spread = (btcPrice / pairPrice) - 1
        
        const btcNormalized = (btcPrice / btcData[0].close) * 100
        const pairNormalized = (pairPrice / pairData[0].close) * 100
        
        data.push({
          timestamp: new Date(btcData[i].timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          btcPrice: normalized ? btcNormalized : btcPrice,
          pairPrice: normalized ? pairNormalized : pairPrice,
          spread: spread * 100, // Convert to percentage
          rawSpread: spread
        })
      }
      
      setChartData(data.slice(-50)) // Last 50 data points
    }
  }, [btcData, pairData, normalized])
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          {payload.map((p: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-sm text-gray-300">{p.dataKey}</span>
              </div>
              <span className="font-mono text-sm font-medium">
                {p.dataKey === 'spread' 
                  ? `${p.value.toFixed(2)}%`
                  : normalized 
                    ? `${p.value.toFixed(1)}` 
                    : `$${p.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                }
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }
  
  const latestSpread = chartData.length > 0 ? chartData[chartData.length - 1].rawSpread : 0
  const spreadColor = latestSpread > 0 ? 'text-red-400' : 'text-green-400'
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-300">Price & Spread Analysis</h3>
          <p className="text-sm text-gray-500">BTC/USDT vs {pair.replace('USDT', '/USDT')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-sm text-gray-400">BTC/USDT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-400">{pair.replace('USDT', '')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-gray-400">Spread</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setNormalized(!normalized)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              normalized 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {normalized ? 'Normalized' : 'Actual'}
          </button>
          <button
            onClick={() => setShowSpread(!showSpread)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              showSpread 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {showSpread ? 'Hide Spread' : 'Show Spread'}
          </button>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="timestamp" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => normalized ? `${value}` : `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* BTC Price Line */}
            <Line
              type="monotone"
              dataKey="btcPrice"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              name="BTC/USDT"
            />
            
            {/* Pair Price Line */}
            <Line
              type="monotone"
              dataKey="pairPrice"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name={pair.replace('USDT', '')}
            />
            
            {/* Spread Area */}
            {showSpread && (
              <Line
                type="monotone"
                dataKey="spread"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={false}
                name="Spread %"
                strokeDasharray="3 3"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Current Spread</div>
          <div className={`text-xl font-bold ${spreadColor} flex items-center gap-2`}>
            {latestSpread > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {(latestSpread * 100).toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Spread Mean</div>
          <div className="text-xl font-bold text-gray-300">
            {chartData.length > 0 
              ? (chartData.reduce((a, b) => a + b.rawSpread, 0) / chartData.length * 100).toFixed(2)
              : '0.00'}%
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Spread Std Dev</div>
          <div className="text-xl font-bold text-gray-300">
            {(() => {
              if (chartData.length === 0) return '0.00%'
              const mean = chartData.reduce((a, b) => a + b.rawSpread, 0) / chartData.length
              const variance = chartData.reduce((a, b) => a + Math.pow(b.rawSpread - mean, 2), 0) / chartData.length
              return (Math.sqrt(variance) * 100).toFixed(2) + '%'
            })()}
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Data Points</div>
          <div className="text-xl font-bold text-gray-300">{chartData.length}</div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          Spread = (BTC Price / {pair.replace('USDT', '')} Price) - 1
          {normalized && ' • Prices normalized to 100 at start of period'}
        </p>
      </div>
    </div>
  )
}