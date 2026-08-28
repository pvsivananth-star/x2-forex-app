import {MarketAsset} from '../../models';

export interface MarketResult {
    /** Normalized market assets returned by a provider adapter. */
    data: MarketAsset[];

    /** True only when the adapter could not return usable market data. */
    isOffline: boolean;

    /** Client-side timestamp when the adapter completed normalization. */
    timestamp: number;
}

export function createMarketResult(
    data: MarketAsset[],
    timestamp = Date.now(),
): MarketResult {
    return {
        data,
        isOffline: data.length === 0,
        timestamp,
    };
}
