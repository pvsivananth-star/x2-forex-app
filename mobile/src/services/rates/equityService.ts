import {EQUITY_ORDER} from '../../catalogs';
import { MarketAsset } from '../../models';
import {MarketResult} from './types';

const EQUITY_API_URL =
    'https://query1.finance.yahoo.com/v8/finance/chart';

const EQUITY_TICKERS: Record<string, string> = {
    SPX: '^GSPC',
    NDX: '^NDX',
    DJI: '^DJI',
    RUT: '^RUT',

    FTSE: '^FTSE',
    DAX: '^GDAXI',
    CAC: '^FCHI',
    NIKKEI: '^N225',

    HSI: '^HSI',
    SHCOMP: '000001.SS',
    SENSEX: '^BSESN',
    NIFTY50: '^NSEI',
    KOSPI: '^KS11',
    ASX200: '^AXJO',
    TSX: '^GSPTSE',
    IBOV: '^BVSP',
};

async function fetchIndex(
    symbol: string,
): Promise<MarketAsset | null> {
    const ticker = EQUITY_TICKERS[symbol];

    if (!ticker) {
        return null;
    }

    try {
        const url =
            `${EQUITY_API_URL}/${encodeURIComponent(ticker)}` +
            '?range=1d&interval=1m';

        const response =
            await fetch(url);

        if (!response.ok) {
            return null;
        }

        const json =
            await response.json();

        const result =
            json?.chart?.result?.[0];

        const meta =
            result?.meta;

        const price =
            Number(
                meta?.regularMarketPrice ??
                meta?.previousClose,
            );

        if (
            !Number.isFinite(price) ||
            price <= 0
        ) {
            return null;
        }

        const previousClose =
            Number(
                meta?.previousClose ??
                price,
            );

        const changePct =
            Number.isFinite(previousClose) &&
            previousClose > 0
                ? ((price - previousClose) /
                    previousClose) *
                100
                : 0;

        const catalog =
            EQUITY_ORDER.find(
                item =>
                    item.symbol ===
                    symbol,
            );

        if (!catalog) {
            return null;
        }

        return {
            symbol,
            name: catalog.name,
            rate: price,
            referenceRate: price,
            changePct,
            category: 'equity',
        } as MarketAsset;
    } catch {
        return null;
    }
}

export async function fetchEquityRates(): Promise<MarketResult> {
    const results =
        await Promise.all(
            EQUITY_ORDER.map(
                item =>
                    fetchIndex(
                        item.symbol,
                    ),
            ),
        );

    const data =
        results.filter(
            (
                item,
            ): item is MarketAsset =>
                item !== null,
        );

    const priority =
        new Map(
            EQUITY_ORDER.map(
                item => [
                    item.symbol,
                    item.priority,
                ],
            ),
        );

    data.sort(
        (a, b) =>
            (
                priority.get(
                    a.symbol,
                ) ?? 99999
            ) -
            (
                priority.get(
                    b.symbol,
                ) ?? 99999
            ),
    );

    return {
        data,
        isOffline:
            data.length === 0,
        timestamp:
            Date.now(),
    };
}