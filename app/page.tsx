<header className="mb-6">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold gradient-text">
        Mean Reversion Pair Scanner
      </h1>
      <p className="text-sm text-gray-400">
        Real-time statistical arbitrage on Binance
      </p>
    </div>

    <div className="flex flex-wrap gap-3 items-center">
      {/* timeframe select */}
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

      {/* refresh */}
      <button
        onClick={startScanner}
        disabled={isScanning}
        className={`px-5 py-2 rounded-lg font-medium ${
          isScanning
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90'
        }`}
      >
        {isScanning ? 'Scanning…' : 'Refresh'}
      </button>
    </div>
  </div>
</header>
