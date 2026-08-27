import { CRYPTO_DEFAULT_CATALOG } from '../../catalogs';
import { MarketResult } from './types';
export async function fetchCryptoRates(): Promise<MarketResult> {
  // Existing CoinGecko/provider adapter belongs here. Do not impose a top-10 slice on returned data.
  return { data: CRYPTO_DEFAULT_CATALOG, isOffline: false, timestamp: Date.now() };
}
