'use client'

import { TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react'

interface Signal {
  pair: string
  correlation: number
  zScore: number
  signal: string
  confidence: number
  action: string
  currentPrice: number
  spread: number
}

interface MeanReversionSignalsProps {
  signals: Signal[]
  onSelectPair: (pair: string) => void
}

export default function MeanReversionSignals({ signals, onSelectPair }: MeanReversionSignalsProps) {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG BUY': return 'text-green-400 bg-green-400/10'
      case 'STRONG SELL': return 'text-red-400 bg-red-400/10'
      case 'WEAK BUY': return 'text-emerald-400 bg-emerald-400/10'
      case 'WEAK SELL': return 'text-orange-400 bg-orange-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getZScoreColor = (zScore: number) => {
    const absZ = Math.abs(zScore)
    if (absZ > 2.5) return 'text-red-300'
    if (absZ > 2.0) return 'text-orange-300'
    if (absZ > 1.5) return 'text-yellow-300'
    return 'text-gray-400'
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Mean Reversion Signals
        </h3>
        <span className="text-sm text-gray-500">
          {signals.length} active signals
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-800">
              <th className="pb-3 px-2">Pair</th>
              <th className="pb-3 px-2">Signal</th>
              <th className="pb-3 px-2">Z-Score</th>
              <th className="pb-3 px-2">Correlation</th>
              <th className="pb-3 px-2">Confidence</th>
              <th className="pb-3 px-2">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {signals.map((signal, index) => (
              <tr 
                key={signal.pair} 
                className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors"
                onClick={() => onSelectPair(signal.pair)}
              >
                <td className="py-3 px-2">
                  <div className="font-mono">{signal.pair.replace('USDT', '/USDT')}</div>
                  <div className="text-xs text-gray-500">
                    ${signal.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getSignalColor(signal.signal)}`}>
                    {signal.signal.includes('BUY') ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="font-medium">{signal.signal.split(' ')[0]}</span>
                  </div>
                </td>
                <td className={`py-3 px-2 font-mono font-bold ${getZScoreColor(signal.zScore)}`}>
                  {signal.zScore > 0 ? '+' : ''}{signal.zScore.toFixed(2)}σ
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-800 rounded-full h-2">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${Math.abs(signal.correlation) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300">
                      {signal.correlation.toFixed(3)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-800 rounded-full h-2">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                    <span className="text-gray-300">{signal.confidence}%</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                    signal.action === 'TRADE' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : signal.action === 'WATCH' 
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {signal.action === 'TRADE' && <Zap className="w-3 h-3" />}
                    {signal.action === 'WATCH' && <AlertTriangle className="w-3 h-3" />}
                    {signal.action}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {signals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No strong mean reversion signals detected. Try adjusting correlation threshold.
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Z-Score Legend:</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" /> |Z| &gt; 2.5 = Strong
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" /> |Z| &gt; 2.0 = Medium
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500" /> |Z| &lt; 2.0 = Weak
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}