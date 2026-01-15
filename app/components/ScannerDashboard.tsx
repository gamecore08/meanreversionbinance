'use client'

import { useState, useEffect } from 'react'
import { Radar, TrendingUp, AlertTriangle, Clock } from 'lucide-react'

interface ScannerDashboardProps {
  correlatedPairs: any[]
  isScanning: boolean
}

export default function ScannerDashboard({ correlatedPairs, isScanning }: ScannerDashboardProps) {
  const [scanProgress, setScanProgress] = useState(0)
  
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) return 95
          return prev + 5
        })
      }, 300)
      
      return () => clearInterval(interval)
    } else {
      setScanProgress(100)
      setTimeout(() => setScanProgress(0), 1000)
    }
  }, [isScanning])
  
  const topPairs = correlatedPairs.slice(0, 5)
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Radar className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300">Scanner Dashboard</h3>
            <p className="text-sm text-gray-500">Real-time correlation analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-sm text-gray-400">
            {isScanning ? 'Scanning...' : 'Idle'}
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Scan Progress</span>
          <span>{scanProgress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${scanProgress}%` }}
          />
        </div>
      </div>
      
      {/* Top Correlated Pairs */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Most Correlated with BTC/USDT
        </h4>
        
        <div className="space-y-3">
          {topPairs.map((pair, index) => (
            <div 
              key={pair.pair} 
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700/50">
                  <span className="text-sm font-semibold text-gray-300">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <div className="font-mono font-medium">
                    {pair.pair.replace('USDT', '/USDT')}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${pair.currentPrice.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-cyan-400">
                  {pair.correlation.toFixed(3)}
                </div>
                <div className={`text-xs ${pair.zScore > 2 ? 'text-red-400' : pair.zScore < -2 ? 'text-green-400' : 'text-gray-500'}`}>
                  Z: {pair.zScore > 0 ? '+' : ''}{pair.zScore.toFixed(2)}σ
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="mt-6 pt-5 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {correlatedPairs.length}
            </div>
            <div className="text-xs text-gray-500">Pairs Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {correlatedPairs.filter(p => p.correlation > 0.8).length}
            </div>
            <div className="text-xs text-gray-500">Strong Corr (≥0.8)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {correlatedPairs.filter(p => Math.abs(p.zScore) > 2).length}
            </div>
            <div className="text-xs text-gray-500">Strong Signals</div>
          </div>
        </div>
      </div>
      
      {/* Scanner Tips */}
      <div className="mt-5 pt-4 border-t border-gray-800">
        <div className="flex items-start gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-gray-400">
            <span className="font-medium text-gray-300">Tip:</span> Pairs with correlation ≥ 0.8 and |Z-Score| ≥ 2.0 are best for mean reversion trading.
          </div>
        </div>
      </div>
    </div>
  )
}