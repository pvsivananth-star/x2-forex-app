import {METAL_CATALOG} from '../../catalogs/metals';
import {fetchMetalsData} from '../../ratesApi';
import {MarketAsset, Tenor} from '../../models';
import {MarketResult} from './types';

export async function fetchMetalsRates(
    tenor: Tenor,
): Promise<MarketResult> {
    const fetched = await fetchMetalsData(tenor);

    const data: MarketAsset[] = Object.entries(fetched)
        .map(([symbol, quote]) => {
            const catalog = METAL_CATALOG.find(
                asset => asset.symbol === symbol,
            );

            if (!catalog) {
                return null;
            }

            return {
                ...catalog,
                rate: quote.rate,
                referenceRate: quote.referenceRate,
                changePct: quote.changePct,
            };
        })
        .filter(
            (asset): asset is MarketAsset =>
                asset !== null,
        );

    return {
        data,
        isOffline: data.length === 0,
        timestamp: Date.now(),
    };
}
