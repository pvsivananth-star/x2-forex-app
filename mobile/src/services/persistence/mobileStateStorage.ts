import {getItem, setItem} from './storage';
import type {PersistedSettings} from '../../models';

const STORAGE_KEY = '@x2_mobile_settings_v5';

export async function loadMobileState(): Promise<PersistedSettings | null> {
    return getItem<PersistedSettings>(STORAGE_KEY);
}

export async function saveMobileState(
    state: PersistedSettings,
): Promise<void> {
    await setItem(STORAGE_KEY, state);
}
