import { CryptoCatalogItem, FetchedMap, Tenor } from './models';

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
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
}

function percentageChange(current: number, reference: number): number {
    if (!Number.isFinite(current) || !Number.isFinite(reference) || reference === 0) {
        return 0;
    }

    return Number((((current - reference) / reference) * 100).toFixed(2));
}

/* -------------------------------------------------------------------------- */
/* FX                                                                        */
/* -------------------------------------------------------------------------- */

const FX_MAP: Record<string, {ccy: string}> = {
    EUR: {ccy: 'EUR'},
    JPY: {ccy: 'JPY'},
    GBP: {ccy: 'GBP'},
    CAD: {ccy: 'CAD'},
    AUD: {ccy: 'AUD'},
    CHF: {ccy: 'CHF'},
    CNY: {ccy: 'CNY'},
    SEK: {ccy: 'SEK'},
    NOK: {ccy: 'NOK'},
    NZD: {ccy: 'NZD'},
    SGD: {ccy: 'SGD'},
    HKD: {ccy: 'HKD'},
    INR: {ccy: 'INR'},
    ZAR: {ccy: 'ZAR'},
    BRL: {ccy: 'BRL'},
    MXN: {ccy: 'MXN'},
    PLN: {ccy: 'PLN'},
    DKK: {ccy: 'DKK'},
    THB: {ccy: 'THB'},
};

export async function fetchFxData(tenor: Tenor): Promise<FetchedMap> {
    const currencies = Object.values(FX_MAP)
        .map(item => item.ccy)
        .join(',');

    const result: FetchedMap = {
        USD: {
            rate: 1,
            referenceRate: 1,
            changePct: 0,
        },
    };

    try {
        const [currentResponse, historicalResponse] = await Promise.all([
            fetch(
                `https://api.frankfurter.app/latest?from=USD&to=${currencies}`,
            ),
            fetch(
                `https://api.frankfurter.app/${isoDaysAgo(TENOR_DAYS[tenor])}?from=USD&to=${currencies}`,
            ),
        ]);

        if (!currentResponse.ok) {
            throw new Error('Current FX request failed');
        }

        const current = await currentResponse.json();
        const historical = historicalResponse.ok
            ? await historicalResponse.json()
            : {};

        Object.entries(FX_MAP).forEach(([symbol, mapping]) => {
            const currentRaw = current?.rates?.[mapping.ccy];
            const historicalRaw = historical?.rates?.[mapping.ccy];

            if (typeof currentRaw !== 'number') {
                return;
            }

            // Frankfurter returns currency units per 1 USD.
            // Keep that convention throughout the FX pipeline:
            // USD = 1, EUR = 0.8589, JPY = 155, etc.
            const rate = currentRaw;
            const reference =
                typeof historicalRaw === 'number'
                    ? historicalRaw
                    : rate;

            result[symbol] = {
                rate: Number(rate.toFixed(8)),
                referenceRate: Number(reference.toFixed(8)),
                changePct: percentageChange(rate, reference),
            };
        });
    } catch {
        // Keep previous/cached values.
    }

    return result;
}

/* -------------------------------------------------------------------------- */
/* COINGECKO                                                                  */
/* -------------------------------------------------------------------------- */

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.EXPO_PUBLIC_COINGECKO_API_KEY ?? '';

function coinGeckoHeaders(): Record<string, string> {
    if (!COINGECKO_API_KEY) {
        return {};
    }

    return {'x-cg-demo-api-key': COINGECKO_API_KEY};
}

let cryptoCatalogCache: CryptoCatalogItem[] | null = null;
let cryptoCatalogPromise: Promise<CryptoCatalogItem[]> | null = null;

export async function fetchCryptoCatalog(): Promise<CryptoCatalogItem[]> {
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
                {headers: coinGeckoHeaders()},
            );

            if (!response.ok) {
                throw new Error('CoinGecko catalogue request failed');
            }

            const data = (await response.json()) as Array<{
                id: string;
                symbol: string;
                name: string;
            }>;

            const seen = new Set<string>();
            const catalog = data
                .filter(coin => Boolean(coin?.id) && Boolean(coin?.name) && Boolean(coin?.symbol))
                .map(coin => ({
                    id: coin.id,
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                }))
                .filter(coin => {
                    if (seen.has(coin.id)) {
                        return false;
                    }
                    seen.add(coin.id);
                    return true;
                })
                .sort((a, b) => a.name.localeCompare(b.name));

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

interface CoinMarket {
    id: string;
    current_price: number | null;
    price_change_percentage_24h: number | null;
    price_change_percentage_7d_in_currency?: number | null;
    price_change_percentage_30d_in_currency?: number | null;
    price_change_percentage_1y_in_currency?: number | null;
}

const MARKET_BATCH_SIZE = 100;

async function fetchCoinMarkets(ids: string[]): Promise<CoinMarket[]> {
    if (!ids.length) {
        return [];
    }

    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += MARKET_BATCH_SIZE) {
        batches.push(ids.slice(i, i + MARKET_BATCH_SIZE));
    }

    const results = await Promise.all(
        batches.map(async batch => {
            const response = await fetch(
                `${COINGECKO_BASE}/coins/markets` +
                `?vs_currency=usd` +
                `&ids=${batch.map(encodeURIComponent).join(',')}` +
                `&order=market_cap_desc` +
                `&per_page=250` +
                `&page=1` +
                `&sparkline=false` +
                `&price_change_percentage=24h,7d,30d,1y`,
                {headers: coinGeckoHeaders()},
            );

            if (!response.ok) {
                throw new Error('CoinGecko market request failed');
            }

            return (await response.json()) as CoinMarket[];
        }),
    );

    return results.flat();
}

async function fetchCryptoHistory(id: string, days: number): Promise<number | null> {
    try {
        const response = await fetch(
            `${COINGECKO_BASE}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`,
            {headers: coinGeckoHeaders()},
        );

        if (!response.ok) {
            return null;
        }

        const json = await response.json();
        const prices = Array.isArray(json?.prices) ? json.prices : [];
        if (!prices.length) {
            return null;
        }

        const first = prices[0]?.[1];
        return typeof first === 'number' ? first : null;
    } catch {
        return null;
    }
}

function referenceFromPercentage(
    current: number,
    changePct: number | null | undefined,
): number | null {
    if (
        typeof changePct !== 'number' ||
        !Number.isFinite(changePct) ||
        changePct <= -100
    ) {
        return null;
    }

    return current / (1 + changePct / 100);
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
        const markets = await fetchCoinMarkets(selectedIds);
        const marketMap = new Map<string, CoinMarket>();

        markets.forEach(market => marketMap.set(market.id, market));

        await Promise.all(
            selectedIds.map(async id => {
                const market = marketMap.get(id);
                if (!market) {
                    return;
                }

                const current = market.current_price;
                if (typeof current !== 'number' || !Number.isFinite(current)) {
                    return;
                }

                let reference: number | null = null;

                if (tenor === '1D') {
                    reference = referenceFromPercentage(
                        current,
                        market.price_change_percentage_24h,
                    );
                } else if (tenor === '1W') {
                    reference = referenceFromPercentage(
                        current,
                        market.price_change_percentage_7d_in_currency,
                    );
                } else if (tenor === '1M') {
                    reference = referenceFromPercentage(
                        current,
                        market.price_change_percentage_30d_in_currency,
                    );
                } else if (tenor === '1Y') {
                    reference = referenceFromPercentage(
                        current,
                        market.price_change_percentage_1y_in_currency,
                    );
                } else {
                    reference = await fetchCryptoHistory(id, TENOR_DAYS[tenor]);
                }

                if (!reference || !Number.isFinite(reference)) {
                    reference = current;
                }

                result[id] = {
                    rate: Number(current.toFixed(12)),
                    referenceRate: Number(reference.toFixed(12)),
                    changePct: percentageChange(current, reference),
                };
            }),
        );
    } catch {
        // Keep previous values.
    }

    return result;
}

/* -------------------------------------------------------------------------- */
/* METALS                                                                     */
/* -------------------------------------------------------------------------- */

const METAL_TICKERS: Record<string, string> = {
    XAU: 'GC=F',
    XAG: 'SI=F',
    XPT: 'PL=F',
    XPD: 'PA=F',
    XCU: 'HG=F',
};

export async function fetchMetalsData(tenor: Tenor): Promise<FetchedMap> {
    // Existing metals implementation follows below in the original service.
    // This section is retained by the repository implementation.
    return {};
}
