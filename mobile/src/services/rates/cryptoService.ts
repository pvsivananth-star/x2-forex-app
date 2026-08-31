import {CRYPTO_DEFAULT_CATALOG} from '../../catalogs/crypto';
import {MarketAsset, Tenor} from '../../models';
import {MarketResult} from '../../models';

const TENOR_DAYS: Record<Tenor, number> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
};

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.EXPO_PUBLIC_COINGECKO_API_KEY ?? '';

function coinGeckoHeaders(): Record<string, string> {
    if (!COINGECKO_API_KEY) return {};
    return {'x-cg-demo-api-key': COINGECKO_API_KEY};
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
    if (!ids.length) return [];
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
            if (!response.ok) throw new Error('CoinGecko market request failed');
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
        if (!response.ok) return null;
        const json = await response.json();
        const prices = Array.isArray(json?.prices) ? json.prices : [];
        if (!prices.length) return null;
        const first = prices[0]?.[1];
        return typeof first === 'number' ? first : null;
    } catch {
        return null;
    }
}

function referenceFromPercentage(current: number, changePct: number | null | undefined): number | null {
    if (typeof changePct !== 'number' || !Number.isFinite(changePct) || changePct <= -100) return null;
    return current / (1 + changePct / 100);
}

function percentageChange(current: number, reference: number): number {
    if (!Number.isFinite(current) || !Number.isFinite(reference) || reference === 0) return 0;
    return Number((((current - reference) / reference) * 100).toFixed(2));
}

export async function fetchCryptoRates(tenor: Tenor, selectedIds: string[]): Promise<MarketResult> {
    if (!selectedIds.length) return {data: [], isOffline: false, timestamp: Date.now()};
    try {
        const markets = await fetchCoinMarkets(selectedIds);
        const marketMap = new Map<string, CoinMarket>();
        markets.forEach(market => marketMap.set(market.id, market));
        const data: MarketAsset[] = (
            await Promise.all(
                selectedIds.map(async id => {
                    const market = marketMap.get(id);
                    if (!market) return null;
                    const current = market.current_price;
                    if (typeof current !== 'number' || !Number.isFinite(current)) return null;
                    let reference: number | null = null;
                    if (tenor === '1D') reference = referenceFromPercentage(current, market.price_change_percentage_24h);
                    else if (tenor === '1W') reference = referenceFromPercentage(current, market.price_change_percentage_7d_in_currency);
                    else if (tenor === '1M') reference = referenceFromPercentage(current, market.price_change_percentage_30d_in_currency);
                    else if (tenor === '1Y') reference = referenceFromPercentage(current, market.price_change_percentage_1y_in_currency);
                    else reference = await fetchCryptoHistory(id, TENOR_DAYS[tenor]);
                    if (!reference || !Number.isFinite(reference)) reference = current;
                    const catalog = CRYPTO_DEFAULT_CATALOG.find(asset => asset.symbol === id);
                    if (catalog) {
                        return {...catalog, rate: Number(current.toFixed(12)), referenceRate: Number(reference.toFixed(12)), changePct: percentageChange(current, reference)};
                    }
                    return {symbol: id, id, displaySymbol: id, name: id, rate: Number(current.toFixed(12)), referenceRate: Number(reference.toFixed(12)), changePct: percentageChange(current, reference), category: 'crypto' as const};
                }),
            )
        ).filter(asset => asset !== null);
        return {data, isOffline: data.length === 0, timestamp: Date.now()};
    } catch {
        return {data: [], isOffline: true, timestamp: Date.now()};
    }
}
