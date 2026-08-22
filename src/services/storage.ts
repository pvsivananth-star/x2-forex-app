import { MMKV } from 'react-native-mmkv';

let storageInstance: MMKV | null = null;

try {
    storageInstance = new MMKV();
} catch (e) {
    console.warn('MMKV initialization deferred/unavailable, running in-memory fallback.', e);
}

export const KEYS = {
    RATES_CACHE: 'x2_rates_cache',
    OFFLINE_TIMESTAMP: 'x2_offline_timestamp',
    USER_PREFERENCES: 'x2_user_prefs',
};

export interface CachedData {
    rates: Record<string, number>;
    timestamp: string;
}

const memoryStore: Record<string, string> = {};

export const saveCachedRates = (rates: Record<string, number>): void => {
    const timestamp = new Date().toISOString();
    const ratesJson = JSON.stringify(rates);

    if (storageInstance) {
        storageInstance.set(KEYS.RATES_CACHE, ratesJson);
        storageInstance.set(KEYS.OFFLINE_TIMESTAMP, timestamp);
    } else {
        memoryStore[KEYS.RATES_CACHE] = ratesJson;
        memoryStore[KEYS.OFFLINE_TIMESTAMP] = timestamp;
    }
};

export const getCachedRates = (): CachedData | null => {
    let ratesData: string | undefined;
    let timestamp: string | undefined;

    if (storageInstance) {
        ratesData = storageInstance.getString(KEYS.RATES_CACHE);
        timestamp = storageInstance.getString(KEYS.OFFLINE_TIMESTAMP);
    } else {
        ratesData = memoryStore[KEYS.RATES_CACHE];
        timestamp = memoryStore[KEYS.OFFLINE_TIMESTAMP];
    }

    if (!ratesData) return null;

    return {
        rates: JSON.parse(ratesData),
        timestamp: timestamp || new Date().toISOString(),
    };
};