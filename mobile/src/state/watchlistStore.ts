import {DEFAULT_CRYPTO, DEFAULT_FX, DEFAULT_METALS} from '../catalogs';
import {WatchlistCategory, WatchlistState} from '../models/watchlist';

let state: WatchlistState = {fx: [...DEFAULT_FX], crypto: [...DEFAULT_CRYPTO], metals: [...DEFAULT_METALS]};
const listeners = new Set<() => void>();
export const watchlistStore = {
    get: () => state,
    set: (next: Partial<WatchlistState>) => {
        state = {...state, ...next};
        listeners.forEach(x => x());
    },
    reorder: (category: WatchlistCategory, order: string[]) => {
        if (category === 'fx' && (order[0] !== 'USD' || order.indexOf('USD') !== 0)) return;
        state = {...state, [category]: order};
        listeners.forEach(x => x());
    },
    add: (category: WatchlistCategory, symbol: string) => {
        if (!state[category].includes(symbol)) state = {...state, [category]: [...state[category], symbol]};
        listeners.forEach(x => x());
    },
    remove: (category: WatchlistCategory, symbol: string) => {
        if (category === 'fx' && symbol === 'USD') return;
        if (category === 'crypto' && symbol === 'USD') return;
        state = {...state, [category]: state[category].filter(x => x !== symbol)};
        listeners.forEach(x => x());
    },
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};
