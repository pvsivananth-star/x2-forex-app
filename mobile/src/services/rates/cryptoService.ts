import {CRYPTO_DEFAULT_CATALOG} from '../../catalogs/crypto';
import {MarketAsset, Tenor} from '../../models';
import {MarketResult} from './types';

const COINCAP_BASE = 'https://api.coincap.io/v2';
const COINCAP_IDS: Record<string, string> = {
    bitcoin: 'bitcoin',
    ethereum: 'ethereum',
    tether: 'tether',
    binancecoin: 'binance-coin',
    solana: 'solana',
    ripple: 'xrp',
    'usd-coin': 'usd-coin',
    dogecoin: 'dogecoin',
    cardano: 'cardano',
    'avalanche-2': 'avalanche',
};

type CoinCapAsset = {
    id: string;
    name: string;
    symbol: string;
    priceUsd: string;
    changePercent24Hr: string;
};

function number(value: unknown): number | null {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function referenceFromPercentage(current: number, changePct: number): number {
    if (!Number.isFinite(changePct) || changePct <= -100) return current;
    return current / (1 + changePct / 100);
}

function percentageChange(current: number, reference: number): number {
    if (!Number.isFinite(current) || !Number.isFinite(reference) || reference <= 0) return 0;
    return Number((((current - reference) / reference) * 100).toFixed(2));
}

async function fetchCoinCap(ids: string[]): Promise<CoinCapAsset[]> {
    const providerIds = ids.map(id => COINCAP_IDS[id]).filter(Boolean);
    if (!providerIds.length) return [];

    const response = await fetch(`${COINCAP_BASE}/assets?ids=${providerIds.join(',')}`);
    if (!response.ok) throw new Error(`CoinCap request failed: ${response.status}`);

    const json = await response.json();
    return Array.isArray(json?.data) ? json.data as CoinCapAsset[] : [];
}

function mapCoinCapAsset(catalogId: string, market: CoinCapAsset): MarketAsset | null {
    const current = number(market.priceUsd);
    if (current === null) return null;

    const change24h = Number(market.changePercent24Hr);
    const reference = referenceFromPercentage(current, change24h);
    const catalog = CRYPTO_DEFAULT_CATALOG.find(asset => asset.symbol === catalogId);

    return {
        ...(catalog ?? {
            symbol: catalogId,
            id: catalogId,
            displaySymbol: market.symbol,
            name: market.name,
            category: 'crypto' as const,
            changePct: 0,
            rate: 0,
        }),
        rate: Number(current.toFixed(12)),
        referenceRate: Number(reference.toFixed(12)),
        changePct: percentageChange(current, reference),
    };
}

/**
 * Crypto rates are USD prices: 1 BTC = N USD, 1 ETH = N USD, etc.
 * CoinCap is used because it is keyless and therefore works without an
 * Expo-managed API secret. The catalog order is preserved independently of
 * provider response order.
 */
export async function fetchCryptoRates(_tenor: Tenor, selectedIds: string[]): Promise<MarketResult> {
    const ids = selectedIds.filter(id => id !== 'USD');
    if (!ids.length) {
        return {data: [{symbol: 'USD', name: 'US Dollar', rate: 1, referenceRate: 1, changePct: 0, category: 'crypto'}], isOffline: false, timestamp: Date.now()};
    }

    try {
        const markets = await fetchCoinCap(ids);
        const byProviderId = new Map(markets.map(market => [market.id, market]));
        const data: MarketAsset[] = [];

        for (const id of ids) {
            const market = byProviderId.get(COINCAP_IDS[id]);
            if (!market) continue;
            const mapped = mapCoinCapAsset(id, market);
            if (mapped) data.push(mapped);
        }

        // Always keep USD at the top and preserve the requested catalog order.
        data.unshift({symbol: 'USD', name: 'US Dollar', rate: 1, referenceRate: 1, changePct: 0, category: 'crypto'});

        return {
            data,
            isOffline: data.length === 1,
            timestamp: Date.now(),
        };
    } catch {
        return {
            data: [{symbol: 'USD', name: 'US Dollar', rate: 1, referenceRate: 1, changePct: 0, category: 'crypto'}],
            isOffline: true,
            timestamp: Date.now(),
        };
    }
}
