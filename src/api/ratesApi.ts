import { saveCachedRates, getCachedRates } from '../services/storage';

export interface RatesMap {
    [currencyCode: string]: number; // Relative to 1 USD
}

/**
 * Fetches ECB fiat currency rates via Frankfurter API (Keyless)
 */
export const fetchFiatRates = async (): Promise<RatesMap> => {
    try {
        const response = await fetch('https://api.frankfurter.dev/v1/latest?base=USD');
        const data = await response.json();
        return {
            USD: 1.0,
            ...data.rates,
        };
    } catch (error) {
        console.warn('Failed to fetch fiat rates, using fallback.', error);
        return {};
    }
};

/**
 * Fetches Crypto & Precious Metal spot rates via CoinGecko API (Keyless)
 */
export const fetchCryptoRates = async (): Promise<RatesMap> => {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana,pax-gold&vs_currencies=usd'
        );
        const data = await response.json();

        return {
            BTC: data.bitcoin?.usd ? 1 / data.bitcoin.usd : 0,
            ETH: data.ethereum?.usd ? 1 / data.ethereum.usd : 0,
            USDT: data.tether?.usd ? 1 / data.tether.usd : 0,
            SOL: data.solana?.usd ? 1 / data.solana.usd : 0,
            XAU: data['pax-gold']?.usd ? 1 / data['pax-gold'].usd : 0, // Paxos Gold as XAU proxy
        };
    } catch (error) {
        console.warn('Failed to fetch crypto rates, using fallback.', error);
        return {};
    }
};

/**
 * Unified rate sync engine: Combines sources & updates MMKV cache
 */
export const fetchAllRates = async (): Promise<{ rates: RatesMap; isOffline: boolean }> => {
    try {
        const [fiat, crypto] = await Promise.all([fetchFiatRates(), fetchCryptoRates()]);

        const mergedRates: RatesMap = { ...fiat, ...crypto };

        if (Object.keys(mergedRates).length > 1) {
            saveCachedRates(mergedRates);
            return { rates: mergedRates, isOffline: false };
        }
    } catch (e) {
        console.warn('Network error during sync, falling back to cached storage.');
    }

    // Offline fallback
    const cached = getCachedRates();
    return {
        rates: cached?.rates || {},
        isOffline: true,
    };
};
