import { Tenor } from './MobileService';

export interface FetchedRate {
  rate: number;
  changePct: number;
}
export type FetchedMap = Record<string, FetchedRate>;

const TENOR_DAYS: Record<Tenor, number> = {
  '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365,
};
// approx trading-day offsets from end of a 1y daily series (Yahoo)
const TENOR_TRADING_DAYS: Record<Tenor, number> = {
  '1D': 1, '1W': 5, '1M': 21, '3M': 63, '6M': 126, '1Y': 252,
};

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function pct(current: number, past: number): number {
  if (!past) return 0;
  return Number((((current - past) / past) * 100).toFixed(2));
}

// symbol -> { ccy: Frankfurter code, invert: true if pair is CCY/USD (foreign is base) }
const FX_MAP: Record<string, { ccy: string; invert: boolean }> = {
  EURUSD: { ccy: 'EUR', invert: true },
  GBPUSD: { ccy: 'GBP', invert: true },
  AUDUSD: { ccy: 'AUD', invert: true },
  USDJPY: { ccy: 'JPY', invert: false },
  USDINR: { ccy: 'INR', invert: false },
  USDCAD: { ccy: 'CAD', invert: false },
  USDCHF: { ccy: 'CHF', invert: false },
};

export async function fetchFxData(tenor: Tenor): Promise<FetchedMap> {
  const codes = Object.values(FX_MAP).map(v => v.ccy).join(',');
  const out: FetchedMap = {};
  try {
    const [curRes, pastRes] = await Promise.all([
      fetch(`https://api.frankfurter.app/latest?from=USD&to=${codes}`),
      fetch(`https://api.frankfurter.app/${isoDaysAgo(TENOR_DAYS[tenor])}?from=USD&to=${codes}`),
    ]);
    const cur = await curRes.json();
    const past = await pastRes.json();
    Object.entries(FX_MAP).forEach(([symbol, { ccy, invert }]) => {
      const curRaw = cur?.rates?.[ccy];
      const pastRaw = past?.rates?.[ccy];
      if (typeof curRaw !== 'number') return;
      const curVal = invert ? 1 / curRaw : curRaw;
      const pastVal = typeof pastRaw === 'number' ? (invert ? 1 / pastRaw : pastRaw) : curVal;
      out[symbol] = { rate: Number(curVal.toFixed(6)), changePct: pct(curVal, pastVal) };
    });
  } catch (e) {
    // network/API failure - caller keeps existing cached rates
  }
  return out;
}

// our symbol -> CoinCap asset id (verify against https://api.coincap.io/v2/assets if IDs drift)
const CRYPTO_MAP: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', SOL: 'solana',
  BNB: 'binance-coin', XRP: 'xrp', ADA: 'cardano', DOGE: 'dogecoin',
  AVAX: 'avalanche', USDC: 'usd-coin',
};

export async function fetchCryptoData(tenor: Tenor): Promise<FetchedMap> {
  const out: FetchedMap = {};
  const ids = Object.values(CRYPTO_MAP).join(',');
  try {
    const res = await fetch(`https://api.coincap.io/v2/assets?ids=${ids}`);
    const json = await res.json();
    const bySymbol: Record<string, { id: string; priceUsd: string; changePercent24Hr: string }> = {};
    (json?.data || []).forEach((a: any) => { bySymbol[a.id] = a; });

    if (tenor === '1D') {
      Object.entries(CRYPTO_MAP).forEach(([symbol, id]) => {
        const a = bySymbol[id];
        if (!a) return;
        out[symbol] = { rate: Number(parseFloat(a.priceUsd).toFixed(6)), changePct: Number(parseFloat(a.changePercent24Hr).toFixed(2)) };
      });
      return out;
    }

    const days = TENOR_DAYS[tenor];
    const end = Date.now();
    const start = end - days * 86400000;
    await Promise.all(Object.entries(CRYPTO_MAP).map(async ([symbol, id]) => {
      const a = bySymbol[id];
      if (!a) return;
      const curVal = parseFloat(a.priceUsd);
      try {
        const histRes = await fetch(`https://api.coincap.io/v2/assets/${id}/history?interval=d1&start=${start}&end=${end}`);
        const hist = await histRes.json();
        const first = hist?.data?.[0]?.priceUsd;
        const pastVal = first ? parseFloat(first) : curVal;
        out[symbol] = { rate: Number(curVal.toFixed(6)), changePct: pct(curVal, pastVal) };
      } catch {
        out[symbol] = { rate: Number(curVal.toFixed(6)), changePct: Number(parseFloat(a.changePercent24Hr).toFixed(2)) };
      }
    }));
  } catch (e) {
    // caller keeps existing cached rates
  }
  return out;
}

// Yahoo chart tickers for base metals (per troy oz, copper per lb)
const METAL_TICKERS: Record<string, string> = {
  XAU: 'GC=F', XAG: 'SI=F', XPT: 'PL=F', XPD: 'PA=F', XCU: 'HG=F',
};
// static fallback for feeds with no reliable free source
const RHODIUM_FALLBACK = 4500;

async function fetchYahooSeries(ticker: string): Promise<{ current: number; closes: number[] } | null> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1y`);
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const closes: number[] = result?.indicators?.quote?.[0]?.close?.filter((c: number | null) => c != null) || [];
    const current = result?.meta?.regularMarketPrice ?? closes[closes.length - 1];
    if (!current || !closes.length) return null;
    return { current, closes };
  } catch {
    return null;
  }
}

// unit conversion: base metal price (per oz, or per lb for copper) -> our watchlist symbols
const TROY_OZ_TO_GRAM = 31.1035;
const METAL_UNITS: Record<string, { base: keyof typeof METAL_TICKERS; factor: number }> = {
  XAU_1OZ: { base: 'XAU', factor: 1 },
  XAG_1OZ: { base: 'XAG', factor: 1 },
  XAU_100G: { base: 'XAU', factor: 100 / TROY_OZ_TO_GRAM },
  XAG_1KG: { base: 'XAG', factor: 1000 / TROY_OZ_TO_GRAM },
  XPT_1OZ: { base: 'XPT', factor: 1 },
  XPD_1OZ: { base: 'XPD', factor: 1 },
  XAU_1KG: { base: 'XAU', factor: 1000 / TROY_OZ_TO_GRAM },
  XAG_100OZ: { base: 'XAG', factor: 100 },
  XCU_1LB: { base: 'XCU', factor: 1 },
};

export async function fetchMetalsData(tenor: Tenor): Promise<FetchedMap> {
  const out: FetchedMap = {};
  const baseResults: Record<string, { rate: number; changePct: number }> = {};

  await Promise.all(Object.entries(METAL_TICKERS).map(async ([base, ticker]) => {
    const series = await fetchYahooSeries(ticker);
    if (!series) return;
    const offset = TENOR_TRADING_DAYS[tenor];
    const idx = Math.max(0, series.closes.length - 1 - offset);
    const past = series.closes[idx] ?? series.current;
    baseResults[base] = { rate: series.current, changePct: pct(series.current, past) };
  }));

  Object.entries(METAL_UNITS).forEach(([symbol, { base, factor }]) => {
    const b = baseResults[base];
    if (b) {
      out[symbol] = { rate: Number((b.rate * factor).toFixed(4)), changePct: b.changePct };
    }
  });

  // rhodium has no reliable free feed - static value, flat change
  out.XRH_1OZ = out.XRH_1OZ || { rate: RHODIUM_FALLBACK, changePct: 0 };

  return out;
}
