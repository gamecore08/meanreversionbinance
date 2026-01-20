type Kline = {
  openTime: number;
  close: number;
};

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]) {
  const m = mean(arr);
  const v =
    arr.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, arr.length - 1);
  return Math.sqrt(v);
}

async function fetchKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<Kline[]> {
  const url =
    `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}` +
    `&interval=${encodeURIComponent(interval)}&limit=${limit}`;

  const r = await fetch(url);
  if (!r.ok) throw new Error(`Binance klines failed ${symbol}: ${r.status}`);
  const data = (await r.json()) as any[];

  // kline: [openTime, open, high, low, close, volume, closeTime, ...]
  return data.map((k) => ({
    openTime: Number(k[0]),
    close: Number(k[4]),
  }));
}

/**
 * Z-score of spread = log(A/B) over a rolling window.
 */
export async function computePairZScore(params: {
  a: string;
  b: string;
  interval?: string; // e.g. "1h"
  lookback?: number; // e.g. 200
  window?: number; // e.g. 100
}) {
  const interval = params.interval ?? "1h";
  const lookback = params.lookback ?? 200;
  const window = params.window ?? 100;

  const [ka, kb] = await Promise.all([
    fetchKlines(params.a, interval, lookback),
    fetchKlines(params.b, interval, lookback),
  ]);

  const n = Math.min(ka.length, kb.length);
  if (n < Math.max(50, window + 5)) {
    throw new Error(`Not enough klines: got ${n}, need ~${window + 5}`);
  }

  const closesA = ka.slice(-n).map((x) => x.close);
  const closesB = kb.slice(-n).map((x) => x.close);

  // spread = log(A/B)
  const spreadSeries = closesA.map((pa, i) => Math.log(pa / closesB[i]));

  const recent = spreadSeries.slice(-window);
  const m = mean(recent);
  const s = std(recent);
  const spreadNow = spreadSeries[spreadSeries.length - 1];

  const z = s === 0 ? 0 : (spreadNow - m) / s;

  return {
    z,
    spread: spreadNow,
    priceA: closesA[closesA.length - 1],
    priceB: closesB[closesB.length - 1],
    interval,
    window,
    lookback,
    ts: ka[ka.length - 1]?.openTime ?? Date.now(),
  };
}
