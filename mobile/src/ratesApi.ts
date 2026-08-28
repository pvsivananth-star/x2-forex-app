import {CryptoCatalogItem, FetchedMap, Tenor} from './models';

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

const FX_MAP: Record<string, { ccy: string }> = {
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

