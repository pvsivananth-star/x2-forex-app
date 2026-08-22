import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const KEYS = {
    RATES_CACHE: 'x2_rates_cache',
    OFFLINE_TIMESTAMP: 'x2_offline_timestamp',
    USER_PREFERENCES: 'x2_user_prefs',
};

export interface CachedData {
    rates: Record<string, number>;
    timestamp: string;
}

export const saveCachedRates = (rates: Record<string, number>): void => {
    const timestamp = new Date().toISOString();
    storage.set(KEYS.RATES_CACHE, JSON.stringify(rates));
    storage.set(KEYS.OFFLINE_TIMESTAMP, timestamp);
};

export const getCachedRates = (): CachedData | null => {
    const ratesData = storage.getString(KEYS.RATES_CACHE);
    const timestamp = storage.getString(KEYS.OFFLINE_TIMESTAMP);

    if (!ratesData) return null;

    return {
        rates: JSON.parse(ratesData),
        timestamp: timestamp || new Date().toISOString(),
    };
};
