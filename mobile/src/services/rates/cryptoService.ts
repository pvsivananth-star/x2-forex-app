import {CRYPTO_DEFAULT_CATALOG} from '../../catalogs/crypto';
import {fetchCryptoData} from '../../ratesApi';
import {MarketAsset, Tenor} from '../../models';
import {MarketResult} from './types';

export async function fetchCryptoRates(
    tenor: Tenor,
    selectedIds: string[],
): Promise<MarketResult> {
    const fetched = await fetchCryptoData(
        tenor,
        selectedIds,
    );

    const data: MarketAsset[] = Object.entries(fetched)
        .map(([symbol, quote]) => {
            const catalog = CRYPTO_DEFAULT_CATALOG.find(
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
