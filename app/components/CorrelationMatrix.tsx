'use client'

import { useState } from 'react'
import { Grid, Minus, Plus } from 'lucide-react'

interface CorrelationMatrixProps {
  pairs: any[]
}

export default function CorrelationMatrix({ pairs }: CorrelationMatrixProps) {
  const [selectedPair, setSelectedPair] = useState<string | null>(null)
  
  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue >= 0.8) return 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/50'
    if (absValue >= 0.6) return 'bg-blue-500/20 border border-blue-500/30'
    if (absValue >= 0.4) return 'bg-indigo-500/10 border border-indigo-500/20'
    return 'bg-gray-800/50 border border-gray-700/50'
  }
  
  const getCorrelationTextColor = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue >= 0.8) return 'text-cyan-300'
    if (absValue >= 0.6) return 'text-blue-300'
    if (absValue >= 0.4) return 'text-indigo-300'
    return 'text-gray-400'
  }
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
          <Grid className="w-5 h-5 text-cyan-400" />
          Correlation Matrix
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-500/50" />
            Strong
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-800/50 border border-gray-700/50" />
            Weak
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="pb-3 text-left text-sm text-gray-500 font-normal">Pairs</th>
              {pairs.map(pair => (
                <th 
                  key={pair.pair} 
                  className={`pb-3 px-2 text-sm font-medium cursor-pointer transition-colors ${
                    selectedPair === pair.pair ? 'text-cyan-300' : 'text-gray-400'
                  }`}
                  onClick={() => setSelectedPair(pair.pair)}
                  onMouseEnter={() => setSelectedPair(pair.pair)}
                >
                  {pair.pair.replace('USDT', '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pairs.map(rowPair => (
              <tr key={rowPair.pair} className="border-b border-gray-800/30 last:border-0">
                <td className={`py-3 text-sm font-medium ${
                  selectedPair === rowPair.pair ? 'text-cyan-300' : 'text-gray-400'
                }`}>
                  {rowPair.pair.replace('USDT', '')}
                </td>
                {pairs.map(colPair => {
                  const isSame = rowPair.pair === colPair.pair
                  const correlation = isSame ? 1.0 : 
                    Math.min(rowPair.correlation, colPair.correlation) * 0.9
                  
                  return (
                    <td 
                      key={`${rowPair.pair}-${colPair.pair}`}
                      className={`py-3 px-2 text-center ${
                        selectedPair === rowPair.pair || selectedPair === colPair.pair
                          ? 'bg-gray-800/30'
                          : ''
                      }`}
                    >
                      <div className="flex justify-center">
                        <div className={`
                          w-12 h-8 rounded-lg flex items-center justify-center
                          ${getCorrelationColor(correlation)}
                          ${isSame ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}
                        `}>
                          {isSame ? (
                            <Minus className="w-4 h-4 text-gray-500" />
                          ) : correlation > 0 ? (
                            <Plus className="w-3 h-3 text-green-400" />
                          ) : (
                            <div className="text-red-400 text-xs">−</div>
                          )}
                        </div>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
        <div className="flex justify-between">
          <div>
            <span className="font-medium text-gray-400">Selected:</span>{' '}
            {selectedPair ? selectedPair.replace('USDT', '/USDT') : 'None'}
          </div>
          <div>
            Correlation: {selectedPair ? 
              pairs.find(p => p.pair === selectedPair)?.correlation.toFixed(3) : 
              '--'}
          </div>
        </div>
      </div>
    </div>
  )
}