import { createMMKV } from 'react-native-mmkv';

interface StorageAdapter {
    getString: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    delete: (key: string) => void;
}

const createStorage = (): StorageAdapter => {
    try {
        const instance = createMMKV();
        return {
            getString: (k: string) => instance.getString(k),
            set: (k: string, v: string) => instance.set(k, v),
            delete: (k: string) => instance.remove(k),
        };
    } catch {
        // Fallback if JSI bindings are uninitialized or in Expo/Web
    }

    const memoryStore = new Map<string, string>();
    return {
        getString: (k: string) => memoryStore.get(k),
        set: (k: string, v: string) => {
            memoryStore.set(k, v);
        },
        delete: (k: string) => {
            memoryStore.delete(k);
        },
    };
};

const storageInstance = createStorage();

export const STORAGE_KEYS = {
    RATES_CACHE: 'x2_rates_cache',
};

export interface CachedData {
    timestamp: number;
    rates: Record<string, number>;
}

export const getCachedRates = (): CachedData | null => {
    try {
        const raw = storageInstance.getString(STORAGE_KEYS.RATES_CACHE);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const saveCachedRates = (rates: Record<string, number>): void => {
    try {
        const payload: CachedData = {
            timestamp: Date.now(),
            rates,
        };
        storageInstance.set(STORAGE_KEYS.RATES_CACHE, JSON.stringify(payload));
    } catch (err) {
        console.warn('Failed to persist cache:', err);
    }
};
