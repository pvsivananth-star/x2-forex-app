import * as MMKVModule from 'react-native-mmkv';

// Safely obtain a storage instance regardless of react-native-mmkv version (v2, v3, or v4)
const getStorageInstance = () => {
    try {
        // Version 4+ uses createMMKV function
        if (typeof (MMKVModule as any).createMMKV === 'function') {
            return (MMKVModule as any).createMMKV();
        }
        // Version 2/3 uses export class/constructor
        const MMKVConstructor = (MMKVModule as any).MMKV;
        if (typeof MMKVConstructor === 'function') {
            return new MMKVConstructor();
        }
    } catch (e) {
        // Native bindings not loaded or linked
    }
    return null;
};

const storageInstance = getStorageInstance();

// In-memory fallback
const memoryCache = new Map<string, string>();

export const getItem = (key: string): string | null => {
    try {
        if (storageInstance && typeof storageInstance.getString === 'function') {
            return storageInstance.getString(key) ?? null;
        }
    } catch (e) {
        // Fallback to memory
    }
    return memoryCache.get(key) ?? null;
};

export const setItem = (key: string, value: string): void => {
    try {
        if (storageInstance && typeof storageInstance.set === 'function') {
            storageInstance.set(key, value);
            return;
        }
    } catch (e) {
        // Fallback to memory
    }
    memoryCache.set(key, value);
};

export const removeItem = (key: string): void => {
    try {
        if (storageInstance) {
            if (typeof storageInstance.delete === 'function') {
                storageInstance.delete(key);
                return;
            }
            if (typeof storageInstance.remove === 'function') {
                storageInstance.remove(key);
                return;
            }
        }
    } catch (e) {
        // Fallback to memory
    }
    memoryCache.delete(key);
};