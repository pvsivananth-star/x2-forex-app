import {EQUITY_ORDER} from '../../catalogs';
import {MarketAsset} from '../../models/market';
import {MarketResult} from './types';

export async function fetchEquityRates(): Promise<MarketResult> {
    // Reuse the current country-index provider/data source through this adapter.
    // The catalog controls deterministic US-first ordering.
    const providerData: MarketAsset[] = [];
    const priority = new Map(EQUITY_ORDER.map(x => [x.symbol, x.priority]));
    providerData.sort((a, b) => (priority.get(a.symbol) ?? 99999) - (priority.get(b.symbol) ?? 99999));
    return {data: providerData, isOffline: false, timestamp: Date.now()};
}
