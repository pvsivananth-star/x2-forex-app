import {METAL_CATALOG} from '../../catalogs/metals';
import {MarketAsset, Tenor} from '../../models';
import {MarketResult} from './types';

const TENOR_TRADING_DAYS: Record<Tenor, number> = {
    '1D': 1,
    '1W': 5,
    '1M': 21,
    '3M': 63,
    '6M': 126,
    '1Y': 252,
};

const METAL_TICKERS: Record<string, string> = {
    XAU: 'GC=F', XAG: 'SI=F', XPT: 'PL=F', XPD: 'PA=F', XCU: 'HG=F',
    XAL: 'AL=F', XNI: 'NI=F', XZN: 'ZNC=F', XPB: 'LED=F',
};

const POUNDS_PER_METRIC_TONNE = 2204.62262185;

const METAL_UNITS: Record<string, {base: string; factor: number}> = {
    XAU_1OZ: {base: 'XAU', factor: 1}, XAG_1OZ: {base: 'XAG', factor: 1},
    XPT_1OZ: {base: 'XPT', factor: 1}, XPD_1OZ: {base: 'XPD', factor: 1},
    XCU_1LB: {base: 'XCU', factor: 1}, XAL_1LB: {base: 'XAL', factor: 1 / POUNDS_PER_METRIC_TONNE},
    XNI_1LB: {base: 'XNI', factor: 1 / POUNDS_PER_METRIC_TONNE}, XZN_1LB: {base: 'XZN', factor: 1 / POUNDS_PER_METRIC_TONNE},
    XPB_1LB: {base: 'XPB', factor: 1 / POUNDS_PER_METRIC_TONNE},
};

function percentageChange(current: number, reference: number): number {
    if (!Number.isFinite(current) || !Number.isFinite(reference) || reference === 0) return 0;
    return Number((((current - reference) / reference) * 100).toFixed(2));
}

async function fetchYahooSeries(ticker: string): Promise<{current: number; closes: number[]} | null> {
    try {
        const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1y`,
        );
        if (!response.ok) return null;
        const json = await response.json();
        const chart = json?.chart?.result?.[0];
        const closes = chart?.indicators?.quote?.[0]?.close?.filter(
            (value: number | null): value is number => typeof value === 'number' && Number.isFinite(value),
        ) ?? [];
        const current = chart?.meta?.regularMarketPrice ?? closes[closes.length - 1];
        if (typeof current !== 'number' || !Number.isFinite(current) || !closes.length) return null;
        return {current, closes};
    } catch {
        return null;
    }
}

export async function fetchMetalsRates(tenor: Tenor): Promise<MarketResult> {
    const baseResults: Record<string, {rate: number; referenceRate: number}> = {};
    await Promise.all(
        Object.entries(METAL_TICKERS).map(async ([base, ticker]) => {
            const series = await fetchYahooSeries(ticker);
            if (!series) return;
            const offset = TENOR_TRADING_DAYS[tenor];
            const index = Math.max(0, series.closes.length - 1 - offset);
            const reference = series.closes[index] ?? series.current;
            if (!Number.isFinite(reference) || reference <= 0) return;
            baseResults[base] = {rate: series.current, referenceRate: reference};
        }),
    );
    const data: MarketAsset[] = METAL_CATALOG
        .map(asset => {
            if (asset.symbol === 'USD') return {...asset, rate: 1, referenceRate: 1, changePct: 0};
            const mapping = METAL_UNITS[asset.symbol];
            const base = mapping ? baseResults[mapping.base] : undefined;
            if (!mapping || !base) return null;
            const rate = base.rate * mapping.factor;
            const referenceRate = base.referenceRate * mapping.factor;
            if (!Number.isFinite(rate) || !Number.isFinite(referenceRate) || rate <= 0 || referenceRate <= 0) return null;
            return {...asset, rate: Number(rate.toFixed(8)), referenceRate: Number(referenceRate.toFixed(8)), changePct: percentageChange(rate, referenceRate)};
        })
        .filter(asset => asset !== null);
    return {data, isOffline: data.filter(asset => asset.symbol !== 'USD').length === 0, timestamp: Date.now()};
}
