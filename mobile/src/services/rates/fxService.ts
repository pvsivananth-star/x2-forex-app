import { FX_CATALOG } from '../../catalogs';
import { MarketResult } from './types';
export async function fetchFxRates(): Promise<MarketResult> {
  // Adapter boundary: connect the existing ratesApi here; UI/state must not call providers directly.
  return { data: FX_CATALOG, isOffline: false, timestamp: Date.now() };
}
