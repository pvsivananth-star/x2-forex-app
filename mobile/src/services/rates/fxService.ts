import {FX_CATALOG} from '../../catalogs';
import type {MarketAsset} from '../../models';
import type {Tenor} from '../../models';
import {fetchFxRatesFromProvider} from './fxProvider';

function percentageChange(current: number, reference: number): number {
    if (!Number.isFinite(reference) || reference === 0) return 0;
    return ((current - reference) / reference) * 100;
}

export async function fetchFxRates(tenor: Tenor) {
    try {
        const fetched = await fetchFxRatesFromProvider(tenor);
        const data: MarketAsset[] = FX_CATALOG
            .map(asset => {
                const quote = fetched[asset.symbol];
                if (!quote) return null;
                return {
                    ...asset,
                    rate: quote.rate,
                    referenceRate: quote.referenceRate,
                    changePct: quote.changePct,
                };
            })
            .filter(asset => asset !== null);

        return {
            data,
            isOffline: data.length === 0,
            timestamp: Date.now(),
        };
    } catch {
        return {data: [], isOffline: true, timestamp: Date.now()};
    }
}

export const fetchFxForMobileService = async (tenor: Tenor) => {
    const result = await fetchFxRates(tenor);
    return Object.fromEntries(result.data.map(asset => [asset.symbol, {
        rate: asset.rate,
        referenceRate: asset.referenceRate ?? asset.rate,
        changePct: percentageChange(asset.rate, asset.referenceRate ?? asset.rate),
    }]));
};
