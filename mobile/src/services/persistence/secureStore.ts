import {decrypt, encrypt} from './encryption';
import {getItem, removeItem, setItem} from './storage';

export async function getSecure<T>(key: string): Promise<T | null> {
    const encrypted = await getItem<string>(`secure:${key}`);
    if (!encrypted) return null;
    return JSON.parse(await decrypt(encrypted)) as T;
}

export async function setSecure<T>(key: string, value: T): Promise<void> {
    const encrypted = await encrypt(JSON.stringify(value));
    await setItem(`secure:${key}`, encrypted);
}

export async function removeSecure(key: string): Promise<void> {
    await removeItem(`secure:${key}`);
}
