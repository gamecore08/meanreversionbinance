import type { NextApiRequest, NextApiResponse } from "next";
import { telegramSend } from "../_lib/telegram";
import { redis } from "../_lib/kv";
import { computePairZScore } from "../_lib/zscore";

type PosState = "FLAT" | "LONG" | "SHORT";

const ENTRY_Z = Number(process.env.ENTRY_Z ?? 2.0);
const EXIT_Z = Number(process.env.EXIT_Z ?? 0.5);
const COOLDOWN_MIN = Number(process.env.COOLDOWN_MIN ?? 30);
const COOLDOWN_MS = COOLDOWN_MIN * 60 * 1000;

const INTERVAL = process.env.Z_INTERVAL ?? "1h";
const LOOKBACK = Number(process.env.Z_LOOKBACK ?? 200);
const WINDOW = Number(process.env.Z_WINDOW ?? 100);

// EDIT THIS: pairs to monitor
const PAIRS: Array<{ a: string; b: string }> = [
  { a: "BTCUSDT", b: "ETHUSDT" },
  // { a: "SOLUSDT", b: "BNBUSDT" },
];

function fmt(n: number, d = 2) {
  if (!Number.isFinite(n)) return String(n);
  return n.toFixed(d);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const now = Date.now();
    const out: any[] = [];

    for (const p of PAIRS) {
      const key = `${p.a}:${p.b}`;
      const keyState = `state:${key}`;
      const keyLast = `lastAlert:${key}`;

      const [stateRaw, lastRaw] = await Promise.all([
        redis.get<PosState>(keyState),
        redis.get<number>(keyLast),
      ]);

      const state: PosState = stateRaw ?? "FLAT";
      const lastAlertTs = lastRaw ?? 0;
      const cooledDown = now - lastAlertTs >= COOLDOWN_MS;

      const r = await computePairZScore({
        a: p.a,
        b: p.b,
        interval: INTERVAL,
        lookback: LOOKBACK,
        window: WINDOW,
      });

      let nextState: PosState = state;
      let signal: "ENTRY_LONG" | "ENTRY_SHORT" | "EXIT" | null = null;

      if (state === "FLAT") {
        if (r.z <= -ENTRY_Z) {
          nextState = "LONG";
          signal = "ENTRY_LONG";
        } else if (r.z >= ENTRY_Z) {
          nextState = "SHORT";
          signal = "ENTRY_SHORT";
        }
      } else {
        if (Math.abs(r.z) <= EXIT_Z) {
          nextState = "FLAT";
          signal = "EXIT";
        }
      }

      // send only when signal + cooldown
      if (signal && cooledDown) {
        const msg =
          `<b>${signal}</b>\n` +
          `<b>${p.a} vs ${p.b}</b> (${r.interval})\n` +
          `Z: <b>${fmt(r.z, 2)}</b>\n` +
          `Spread(log A/B): ${fmt(r.spread, 6)}\n` +
          `${p.a}: ${r.priceA}\n` +
          `${p.b}: ${r.priceB}\n` +
          `Rule: entry=${ENTRY_Z}, exit=${EXIT_Z}, cd=${COOLDOWN_MIN}m`;

        await telegramSend(msg);
        // important: state changes only when alert is sent
        await Promise.all([redis.set(keyState, nextState), redis.set(keyLast, now)]);
      }

      out.push({
        pair: key,
        z: r.z,
        state,
        nextState,
        signal,
        cooledDown,
      });
    }

    res.status(200).json({ ok: true, out });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}
