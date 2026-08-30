import {MarketResult} from './types';
import {fetchFxRates} from './fxService';
import {fetchCryptoRates} from './cryptoService';
import {fetchMetalsRates} from './metalsService';
import {fetchEquityRates} from './equityService';
import {Tenor} from '../../models';

export type LegacyFetchedQuote = {
    rate: number;
    referenceRate: number;
    changePct: number;
};

export type LegacyFetchedMap = Record<string, LegacyFetchedQuote>;

function toLegacyMap(result: MarketResult): LegacyFetchedMap {
    return Object.fromEntries(
        result.data.map(asset => [
            asset.symbol,
            {
                rate: asset.rate,
                referenceRate: asset.referenceRate ?? asset.rate,
                changePct: asset.changePct,
            },
        ]),
    );
}

export async function fetchFxForMobileService(tenor: Tenor): Promise<LegacyFetchedMap> {
    return toLegacyMap(await fetchFxRates(tenor));
}

export async function fetchCryptoForMobileService(
    tenor: Tenor,
    selectedIds: string[],
): Promise<LegacyFetchedMap> {
    return toLegacyMap(await fetchCryptoRates(tenor, selectedIds));
}

export async function fetchMetalsForMobileService(tenor: Tenor): Promise<LegacyFetchedMap> {
    return toLegacyMap(await fetchMetalsRates(tenor));
}

export async function fetchEquityForMobileService(): Promise<LegacyFetchedMap> {
    return toLegacyMap(await fetchEquityRates());
}
