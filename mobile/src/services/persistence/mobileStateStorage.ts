import {getItem, setItem} from './storage';
import type {
    PersistedSettings,
    PersistedMarketState,
} from '../../models';

const STORAGE_KEY = '@x2_mobile_settings_v5';

export async function loadMobileState(): Promise<
    (PersistedSettings & {
        marketState?: PersistedMarketState;
    }) | null
> {
    return getItem<
        PersistedSettings & {
        marketState?: PersistedMarketState;
    }
    >(STORAGE_KEY);
}

export async function saveMobileState(
    state: PersistedSettings,
): Promise<void> {
    await setItem(STORAGE_KEY, state);
}
