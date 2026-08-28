import {FX_CATALOG} from '../../catalogs/currencies';
import {fetchFxData} from '../../ratesApi';
import {MarketAsset, Tenor} from '../../models';
import {MarketResult} from './types';

export async function fetchFxRates(
    tenor: Tenor,
): Promise<MarketResult> {
    const fetched = await fetchFxData(tenor);

    const data: MarketAsset[] = Object.entries(fetched)
        .map(([symbol, quote]) => {
            const catalog = FX_CATALOG.find(
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
