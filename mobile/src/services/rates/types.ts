import type {MarketAsset, MarketResult} from '../../models';

export type {MarketResult} from '../../models';

/**
 * Compatibility factory retained for existing rate-service callers.
 * MarketResult itself is defined centrally in the shared models contract.
 */
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
