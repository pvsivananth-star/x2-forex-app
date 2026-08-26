import {
  CryptoCatalogItem,
  FetchedMap,
  Tenor,
} from './types';

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
  const date = new Date();

  date.setDate(
      date.getDate() - days,
  );

  return date
      .toISOString()
      .slice(0, 10);
}

function percentageChange(
    current: number,
    reference: number,
): number {
  if (
      !Number.isFinite(current) ||
      !Number.isFinite(reference) ||
      reference === 0
  ) {
    return 0;
  }

  return Number(
      (
          ((current - reference) / reference) *
          100
      ).toFixed(2),
  );
}

/* -------------------------------------------------------------------------- */
/* FX                                                                        */
/* -------------------------------------------------------------------------- */

const FX_MAP: Record<
    string,
    {
      ccy: string;
      invert: boolean;
    }
> = {
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

export async function fetchFxData(
    tenor: Tenor,
): Promise<FetchedMap> {
  const currencies = Object.values(FX_MAP)
      .map((item) => item.ccy)
      .join(',');

  const result: FetchedMap = {
    USD: {
      rate: 1,
      referenceRate: 1,
      changePct: 0,
    },
  };

  try {
    const [currentResponse, historicalResponse] =
        await Promise.all([
          fetch(
              `https://api.frankfurter.app/latest?from=USD&to=${currencies}`,
          ),

          fetch(
              `https://api.frankfurter.app/${isoDaysAgo(
                  TENOR_DAYS[tenor],
              )}?from=USD&to=${currencies}`,
          ),
        ]);

    if (!currentResponse.ok) {
      throw new Error(
          'Current FX request failed',
      );
    }

    const current =
        await currentResponse.json();

    const historical =
        historicalResponse.ok
            ? await historicalResponse.json()
            : {};

    Object.entries(FX_MAP).forEach(
        ([symbol, mapping]) => {
          const currentRaw =
              current?.rates?.[mapping.ccy];

          const historicalRaw =
              historical?.rates?.[mapping.ccy];

          if (
              typeof currentRaw !== 'number'
          ) {
            return;
          }

          const rate = mapping.invert
              ? 1 / currentRaw
              : currentRaw;

          const reference =
              typeof historicalRaw === 'number'
                  ? mapping.invert
                      ? 1 / historicalRaw
                      : historicalRaw
                  : rate;

          result[symbol] = {
            rate: Number(
                rate.toFixed(8),
            ),

            referenceRate: Number(
                reference.toFixed(8),
            ),

            changePct:
                percentageChange(
                    rate,
                    reference,
                ),
          };
        },
    );
  } catch {
    // Keep cached values.
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* COINGECKO CATALOG                                                         */
/* -------------------------------------------------------------------------- */

const COINGECKO_BASE =
    'https://api.coingecko.com/api/v3';

let cryptoCatalogCache:
    CryptoCatalogItem[] | null = null;

let cryptoCatalogPromise:
    Promise<CryptoCatalogItem[]> | null = null;

export async function fetchCryptoCatalog(): Promise<
    CryptoCatalogItem[]
> {
  if (cryptoCatalogCache) {
    return cryptoCatalogCache;
  }

  if (cryptoCatalogPromise) {
    return cryptoCatalogPromise;
  }

  cryptoCatalogPromise = (async () => {
    try {
      const response = await fetch(
          `${COINGECKO_BASE}/coins/list?include_platform=false`,
      );

      if (!response.ok) {
        throw new Error(
            'CoinGecko catalogue request failed',
        );
      }

      const data =
          (await response.json()) as Array<{
            id: string;
            symbol: string;
            name: string;
          }>;

      const seen = new Set<string>();

      const catalog =
          data
              .filter(
                  (coin) =>
                      coin?.id &&
                      coin?.name &&
                      coin?.symbol,
              )
              .map((coin) => ({
                id: coin.id,
                symbol:
                    coin.symbol.toUpperCase(),
                name: coin.name,
              }))
              .filter((coin) => {
                /*
                 * CoinGecko contains multiple coins with
                 * the same symbol. Keep every coin, but
                 * de-duplicate exact ID entries.
                 */
                const key = coin.id;

                if (seen.has(key)) {
                  return false;
                }

                seen.add(key);

                return true;
              })
              .sort((a, b) =>
                  a.name.localeCompare(b.name),
              );

      cryptoCatalogCache = catalog;

      return catalog;
    } catch {
      return [];
    } finally {
      cryptoCatalogPromise = null;
    }
  })();

  return cryptoCatalogPromise;
}

/* -------------------------------------------------------------------------- */
/* COINGECKO MARKET DATA                                                      */
/* -------------------------------------------------------------------------- */

interface CoinMarket {
  id: string;
  current_price: number | null;
  price_change_percentage_24h:
      | number
      | null;
}

async function fetchCoinMarkets(
    ids: string[],
): Promise<CoinMarket[]> {
  if (!ids.length) {
    return [];
  }

  const response = await fetch(
      `${COINGECKO_BASE}/coins/markets` +
      `?vs_currency=usd` +
      `&ids=${ids
          .map(encodeURIComponent)
          .join(',')}` +
      `&order=market_cap_desc` +
      `&per_page=250` +
      `&page=1` +
      `&sparkline=false`,
  );

  if (!response.ok) {
    throw new Error(
        'CoinGecko market request failed',
    );
  }

  return (
      (await response.json()) as CoinMarket[]
  );
}

async function fetchCryptoHistory(
    id: string,
    days: number,
): Promise<number | null> {
  try {
    const response = await fetch(
        `${COINGECKO_BASE}/coins/${encodeURIComponent(
            id,
        )}/market_chart?vs_currency=usd&days=${days}`,
    );

    if (!response.ok) {
      return null;
    }

    const json = await response.json();

    const prices =
        Array.isArray(json?.prices)
            ? json.prices
            : [];

    if (!prices.length) {
      return null;
    }

    /*
     * First historical point is used as the
     * comparison point for the selected tenor.
     */
    const first = prices[0]?.[1];

    return typeof first === 'number'
        ? first
        : null;
  } catch {
    return null;
  }
}

export async function fetchCryptoData(
    tenor: Tenor,
    selectedIds: string[],
): Promise<FetchedMap> {
  const result: FetchedMap = {};

  if (!selectedIds.length) {
    return result;
  }

  try {
    const markets =
        await fetchCoinMarkets(
            selectedIds,
        );

    const marketMap =
        new Map<string, CoinMarket>();

    markets.forEach((market) => {
      marketMap.set(
          market.id,
          market,
      );
    });

    /*
     * 1D is directly supplied by CoinGecko's
     * market endpoint.
     *
     * Longer tenors use historical market_chart
     * so the displayed percentage is actually
     * recalculated for the selected tenor.
     */
    await Promise.all(
        selectedIds.map(async (id) => {
          const market =
              marketMap.get(id);

          if (!market) {
            return;
          }

          const current =
              market.current_price;

          if (
              typeof current !== 'number' ||
              !Number.isFinite(current)
          ) {
            return;
          }

          let reference: number | null =
              null;

          if (tenor === '1D') {
            reference =
                current /
                (1 +
                    (Number(
                            market.price_change_percentage_24h ??
                            0,
                        ) /
                        100));
          } else {
            reference =
                await fetchCryptoHistory(
                    id,
                    TENOR_DAYS[tenor],
                );
          }

          if (
              !reference ||
              !Number.isFinite(reference)
          ) {
            reference = current;
          }

          result[id] = {
            rate: Number(
                current.toFixed(12),
            ),

            referenceRate: Number(
                reference.toFixed(12),
            ),

            changePct:
                percentageChange(
                    current,
                    reference,
                ),
          };
        }),
    );
  } catch {
    // Keep cached values.
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* METALS                                                                     */
/* -------------------------------------------------------------------------- */

const METAL_TICKERS: Record<
    string,
    string
> = {
  XAU: 'GC=F',
  XAG: 'SI=F',
  XPT: 'PL=F',
  XPD: 'PA=F',
  XCU: 'HG=F',
  XAL: 'ALI=F',
  XNI: 'NI=F',
  XZN: 'ZNC=F',
  XPB: 'LEAD=F',
};

const TROY_OZ_TO_GRAM =
    31.1034768;

const METAL_UNITS: Record<
    string,
    {
      base: string;
      factor: number;
    }
> = {
  XAU_1OZ: {
    base: 'XAU',
    factor: 1,
  },

  XAG_1OZ: {
    base: 'XAG',
    factor: 1,
  },

  XPT_1OZ: {
    base: 'XPT',
    factor: 1,
  },

  XPD_1OZ: {
    base: 'XPD',
    factor: 1,
  },

  XRH_1OZ: {
    base: 'XRH',
    factor: 1,
  },

  XCU_1LB: {
    base: 'XCU',
    factor: 1,
  },

  XAL_1LB: {
    base: 'XAL',
    factor: 1,
  },

  XNI_1LB: {
    base: 'XNI',
    factor: 1,
  },

  XZN_1LB: {
    base: 'XZN',
    factor: 1,
  },

  XPB_1LB: {
    base: 'XPB',
    factor: 1,
  },
};

const METAL_FALLBACKS: Record<
    string,
    number
> = {
  XRH: 4500,
  XAL: 1.1,
  XNI: 7.5,
  XZN: 1.2,
  XPB: 0.95,
};

async function fetchYahooSeries(
    ticker: string,
): Promise<{
  current: number;
  closes: number[];
} | null> {
  try {
    const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
            ticker,
        )}?interval=1d&range=1y`,
    );

    if (!response.ok) {
      return null;
    }

    const json = await response.json();

    const chart =
        json?.chart?.result?.[0];

    const closes =
        chart?.indicators?.quote?.[0]?.close
            ?.filter(
                (
                    value: number | null,
                ) => value != null,
            ) || [];

    const current =
        chart?.meta?.regularMarketPrice ??
        closes[closes.length - 1];

    if (
        typeof current !== 'number' ||
        !closes.length
    ) {
      return null;
    }

    return {
      current,
      closes,
    };
  } catch {
    return null;
  }
}

export async function fetchMetalsData(
    tenor: Tenor,
): Promise<FetchedMap> {
  const result: FetchedMap = {};

  const baseResults: Record<
      string,
      {
        rate: number;
        referenceRate: number;
      }
  > = {};

  await Promise.all(
      Object.entries(METAL_TICKERS).map(
          async ([base, ticker]) => {
            const series =
                await fetchYahooSeries(ticker);

            if (!series) {
              return;
            }

            const offset =
                TENOR_TRADING_DAYS[tenor];

            const index = Math.max(
                0,
                series.closes.length -
                1 -
                offset,
            );

            const reference =
                series.closes[index] ??
                series.current;

            baseResults[base] = {
              rate: series.current,
              referenceRate: reference,
            };
          },
      ),
  );

  Object.entries(METAL_FALLBACKS).forEach(
      ([base, fallback]) => {
        if (!baseResults[base]) {
          baseResults[base] = {
            rate: fallback,
            referenceRate: fallback,
          };
        }
      },
  );

  Object.entries(METAL_UNITS).forEach(
      ([symbol, mapping]) => {
        const base =
            baseResults[mapping.base];

        if (!base) {
          return;
        }

        const rate =
            base.rate * mapping.factor;

        const reference =
            base.referenceRate *
            mapping.factor;

        result[symbol] = {
          rate: Number(
              rate.toFixed(8),
          ),

          referenceRate: Number(
              reference.toFixed(8),
          ),

          changePct:
              percentageChange(
                  rate,
                  reference,
              ),
        };
      },
  );

  return result;
}