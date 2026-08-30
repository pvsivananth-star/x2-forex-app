import {getItem, removeItem, setItem} from './storage';
import type {
    PersistedSettings,
    PersistedMarketState,
} from '../../models';

const STORAGE_KEY = '@x2_mobile_settings_v5';

type StoredMobileState = PersistedSettings & {
    marketState?: PersistedMarketState;
};

export async function loadMobileState(): Promise<StoredMobileState | null> {
    return getItem<StoredMobileState>(STORAGE_KEY);
}

export async function saveMobileState(
    state: PersistedSettings,
): Promise<void> {
    await setItem(STORAGE_KEY, state);
}

export async function clearMobileState(): Promise<void> {
    await removeItem(STORAGE_KEY);
}
