'use client'

import { useState, useEffect } from 'react'
import ScannerDashboard from './components/ScannerDashboard'
import CorrelationMatrix from './components/CorrelationMatrix'
import MeanReversionSignals from './components/MeanReversionSignals'
import PairDetails from './components/PairDetails'
import RealTimeMonitor from './components/RealTimeMonitor'
import { scanCorrelatedPairs, getMeanReversionSignals } from './lib/correlation-scanner'

export default function Home() {
  const [isScanning, setIsScanning] = useState(false)
  const [correlatedPairs, setCorrelatedPairs] = useState<any[]>([])
  const [signals, setSignals] = useState<any[]>([])
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT')
  const [timeframe, setTimeframe] = useState('1h')
  const [threshold, setThreshold] = useState(0.7)

  const startScanner = async () => {
    setIsScanning(true)
    try {
      const results = await scanCorrelatedPairs('BTCUSDT', threshold, timeframe)
      setCorrelatedPairs(results.correlatedPairs)
      
      const meanReversionSignals = await getMeanReversionSignals(results.correlatedPairs)
      setSignals(meanReversionSignals)
    } catch (error) {
      console.error('Scanner error:', error)
    } finally {
      setIsScanning(false)
    }
  }

  useEffect(() => {
    // Auto-start scan on mount
    startScanner()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      if (!isScanning) {
        startScanner()
      }
    }, 300000)

    return () => clearInterval(interval)
  }, [timeframe, threshold])

  const topSignals = signals
    .filter(s => Math.abs(s.zScore) > 2.0)
    .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black p-4 md:p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Binance BTC Pairs Scanner
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time correlation analysis & mean reversion opportunities
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">1 Day</option>
            </select>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Corr ≥</span>
              <input 
                type="range" 
                min="0.5" 
                max="0.95" 
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm font-mono">{threshold.toFixed(2)}</span>
            </div>
            
            <button
              onClick={startScanner}
              disabled={isScanning}
              className={`px-6 py-2 rounded-lg font-medium ${
                isScanning 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90'
              }`}
            >
              {isScanning ? 'Scanning...' : 'Refresh Scan'}
            </button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-400">Correlated Pairs</div>
            <div className="text-2xl font-bold text-green-400">{correlatedPairs.length}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-400">Strong Signals</div>
            <div className="text-2xl font-bold text-yellow-400">
              {signals.filter(s => Math.abs(s.zScore) > 2.5).length}
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-400">Timeframe</div>
            <div className="text-2xl font-bold text-cyan-400">{timeframe}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-400">Last Scan</div>
            <div className="text-2xl font-bold text-purple-400">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scanner Dashboard */}
          <ScannerDashboard 
            correlatedPairs={correlatedPairs}
            isScanning={isScanning}
          />

          {/* Mean Reversion Signals */}
          <MeanReversionSignals 
            signals={topSignals}
            onSelectPair={setSelectedPair}
          />

          {/* Real-time Monitor */}
          <RealTimeMonitor 
            selectedPair={selectedPair}
            timeframe={timeframe}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Correlation Matrix */}
          <CorrelationMatrix 
            pairs={correlatedPairs.slice(0, 8)}
          />

          {/* Pair Details */}
          <PairDetails 
            pair={selectedPair}
            signals={signals.find(s => s.pair === selectedPair)}
          />

          {/* Settings Panel */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Scanner Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Minimum Correlation</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="0.95" 
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5 (Weak)</span>
                  <span className="font-mono">{threshold.toFixed(2)}</span>
                  <span>0.95 (Strong)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Z-Score Threshold</label>
                <div className="flex gap-2">
                  {[1.5, 2.0, 2.5, 3.0].map(z => (
                    <button
                      key={z}
                      className={`px-3 py-1 rounded text-sm ${
                        Math.abs(topSignals[0]?.zScore || 0) > z 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      ±{z}σ
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <div className="text-sm text-gray-400">Scan Status</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                  <span className="text-sm">{isScanning ? 'Scanning Binance pairs...' : 'Ready'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>Data sourced from Binance API • Updates every 5 minutes • Not financial advice</p>
        <p className="mt-1">Pairs with correlation ≥ {threshold} with BTC/USDT • Mean reversion based on 30-day spread history</p>
      </footer>
    </div>
  )
}