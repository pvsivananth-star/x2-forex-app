import {Settings} from '../models/settings';

let state: Settings = {
    activeTab: 'fx',
    tenorFx: '1D',
    tenorCrypto: '1W',
    tenorMetals: '1M',
    decimalPlaces: 4,
    theme: 'system',
};

const listeners = new Set<() => void>();

function emit(): void {
    listeners.forEach(listener => listener());
}

export const settingsStore = {
    get: () => state,

    set: (next: Partial<Settings>) => {
        state = {
            ...state,
            ...next,
        };
        emit();
    },

    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};
