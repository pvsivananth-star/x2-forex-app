import { Tenor } from './MobileService';

export interface FetchedRate {
  rate: number;
  changePct: number;
}

export type FetchedMap = Record<string, FetchedRate>;

const TENOR_DAYS: Record<Tenor, number> = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
};

const TENOR_TRADING_DAYS: Record<Tenor, number> = {
  '1D': 1,
  '1W': 5,
  '1M': 21,
  '3M': 63,
  '6M': 126,
  '1Y': 252,
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

/*
 * Frankfurter provides USD-base rates.
 *
 * Internally the mobile app now stores FX currencies as:
 *
 * USD
 * EUR
 * GBP
 * JPY
 * INR
 *
 * For currencies where USD/CCY is returned, that is the displayed
 * USD-base rate. For EUR/USD-style currencies, we invert.
 */
const FX_MAP: Record<string, { ccy: string; invert: boolean }> = {
  EUR: { ccy: 'EUR', invert: true },
  JPY: { ccy: 'JPY', invert: false },
  GBP: { ccy: 'GBP', invert: true },
  CAD: { ccy: 'CAD', invert: false },
  AUD: { ccy: 'AUD', invert: true },
  CHF: { ccy: 'CHF', invert: false },
  CNY: { ccy: 'CNY', invert: false },
  SEK: { ccy: 'SEK', invert: false },
  NOK: { ccy: 'NOK', invert: false },
  NZD: { ccy: 'NZD', invert: true },
  SGD: { ccy: 'SGD', invert: false },
  HKD: { ccy: 'HKD', invert: false },
  INR: { ccy: 'INR', invert: false },
  ZAR: { ccy: 'ZAR', invert: false },
  BRL: { ccy: 'BRL', invert: false },
  MXN: { ccy: 'MXN', invert: false },
  PLN: { ccy: 'PLN', invert: false },
  DKK: { ccy: 'DKK', invert: false },
  THB: { ccy: 'THB', invert: false },
};

export async function fetchFxData(tenor: Tenor): Promise<FetchedMap> {
  const codes = Object.values(FX_MAP).map((v) => v.ccy).join(',');
  const out: FetchedMap = {
    USD: { rate: 1, changePct: 0 },
  };

  try {
    const [curRes, pastRes] = await Promise.all([
      fetch(`https://api.frankfurter.app/latest?from=USD&to=${codes}`),
      fetch(
          `https://api.frankfurter.app/${isoDaysAgo(
              TENOR_DAYS[tenor],
          )}?from=USD&to=${codes}`,
      ),
    ]);

    if (!curRes.ok) throw new Error('Current FX request failed');

    const cur = await curRes.json();
    const past = pastRes.ok ? await pastRes.json() : {};

    Object.entries(FX_MAP).forEach(([symbol, { ccy, invert }]) => {
      const curRaw = cur?.rates?.[ccy];
      const pastRaw = past?.rates?.[ccy];

      if (typeof curRaw !== 'number') return;

      const curVal = invert ? 1 / curRaw : curRaw;

      const pastVal =
          typeof pastRaw === 'number'
              ? invert
                  ? 1 / pastRaw
                  : pastRaw
              : curVal;

      out[symbol] = {
        rate: Number(curVal.toFixed(6)),
        changePct: pct(curVal, pastVal),
      };
    });
  } catch {
    // Caller retains cached values.
  }

  return out;
}

const CRYPTO_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  SOL: 'solana',
  BNB: 'binance-coin',
  XRP: 'xrp',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  AVAX: 'avalanche',
  USDC: 'usd-coin',
};

export async function fetchCryptoData(tenor: Tenor): Promise<FetchedMap> {
  const out: FetchedMap = {};
  const ids = Object.values(CRYPTO_MAP).join(',');

  try {
    const res = await fetch(
        `https://api.coincap.io/v2/assets?ids=${ids}`,
    );

    if (!res.ok) throw new Error('Crypto request failed');

    const json = await res.json();

    const byId: Record<
        string,
        {
          id: string;
          priceUsd: string;
          changePercent24Hr: string;
        }
    > = {};

    (json?.data || []).forEach((asset: any) => {
      byId[asset.id] = asset;
    });

    if (tenor === '1D') {
      Object.entries(CRYPTO_MAP).forEach(([symbol, id]) => {
        const asset = byId[id];

        if (!asset) return;

        const rate = parseFloat(asset.priceUsd);

        if (!Number.isFinite(rate)) return;

        out[symbol] = {
          rate: Number(rate.toFixed(6)),
          changePct: Number(
              parseFloat(asset.changePercent24Hr || '0').toFixed(2),
          ),
        };
      });

      return out;
    }

    const days = TENOR_DAYS[tenor];
    const end = Date.now();
    const start = end - days * 86400000;

    await Promise.all(
        Object.entries(CRYPTO_MAP).map(async ([symbol, id]) => {
          const asset = byId[id];

          if (!asset) return;

          const current = parseFloat(asset.priceUsd);

          if (!Number.isFinite(current)) return;

          try {
            const historyResponse = await fetch(
                `https://api.coincap.io/v2/assets/${id}/history?interval=d1&start=${start}&end=${end}`,
            );

            const history = await historyResponse.json();
            const first = history?.data?.[0]?.priceUsd;

            const past = first ? parseFloat(first) : current;

            out[symbol] = {
              rate: Number(current.toFixed(6)),
              changePct: pct(current, past),
            };
          } catch {
            out[symbol] = {
              rate: Number(current.toFixed(6)),
              changePct: Number(
                  parseFloat(asset.changePercent24Hr || '0').toFixed(2),
              ),
            };
          }
        }),
    );
  } catch {
    // Caller retains cached values.
  }

  return out;
}

const METAL_TICKERS: Record<string, string> = {
  XAU: 'GC=F',
  XAG: 'SI=F',
  XPT: 'PL=F',
  XPD: 'PA=F',
  XCU: 'HG=F',
};

const RHODIUM_FALLBACK = 4500;
const TROY_OZ_TO_GRAM = 31.1035;

const METAL_UNITS: Record<
    string,
    { base: keyof typeof METAL_TICKERS; factor: number }
> = {
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

async function fetchYahooSeries(
    ticker: string,
): Promise<{ current: number; closes: number[] } | null> {
  try {
    const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
            ticker,
        )}?interval=1d&range=1y`,
    );

    if (!response.ok) return null;

    const json = await response.json();
    const result = json?.chart?.result?.[0];

    const closes =
        result?.indicators?.quote?.[0]?.close?.filter(
            (value: number | null) => value != null,
        ) || [];

    const current =
        result?.meta?.regularMarketPrice ??
        closes[closes.length - 1];

    if (!current || !closes.length) return null;

    return { current, closes };
  } catch {
    return null;
  }
}

export async function fetchMetalsData(
    tenor: Tenor,
): Promise<FetchedMap> {
  const out: FetchedMap = {};

  const baseResults: Record<
      string,
      { rate: number; changePct: number }
  > = {};

  await Promise.all(
      Object.entries(METAL_TICKERS).map(async ([base, ticker]) => {
        const series = await fetchYahooSeries(ticker);

        if (!series) return;

        const offset = TENOR_TRADING_DAYS[tenor];
        const index = Math.max(
            0,
            series.closes.length - 1 - offset,
        );

        const past =
            series.closes[index] ?? series.current;

        baseResults[base] = {
          rate: series.current,
          changePct: pct(series.current, past),
        };
      }),
  );

  Object.entries(METAL_UNITS).forEach(
      ([symbol, { base, factor }]) => {
        const result = baseResults[base];

        if (!result) return;

        out[symbol] = {
          rate: Number((result.rate * factor).toFixed(4)),
          changePct: result.changePct,
        };
      },
  );

  out.XRH_1OZ = out.XRH_1OZ || {
    rate: RHODIUM_FALLBACK,
    changePct: 0,
  };

  return out;
}