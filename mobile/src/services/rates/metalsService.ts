import {METAL_CATALOG} from '../../catalogs';
import {MarketResult} from './types';

export async function fetchMetalsRates(): Promise<MarketResult> {
    return {data: METAL_CATALOG, isOffline: false, timestamp: Date.now()};
}
