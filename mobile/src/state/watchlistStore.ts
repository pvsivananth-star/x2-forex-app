import {
    DEFAULT_CRYPTO,
    DEFAULT_EQUITY,
    DEFAULT_FX,
    DEFAULT_METALS,
} from '../catalogs';

import {
    WatchlistCategory,
    WatchlistState,
} from '../models/watchlist';

let state: WatchlistState = {
    fx: [...DEFAULT_FX],
    equity: [...DEFAULT_EQUITY],
    crypto: [...DEFAULT_CRYPTO],
    metals: [...DEFAULT_METALS],
};

const listeners = new Set<() => void>();

function emit(): void {
    listeners.forEach(listener => listener());
}

export const watchlistStore = {
    get: () => state,

    set: (next: Partial<WatchlistState>) => {
        state = {
            ...state,
            ...next,
        };
        emit();
    },

    reorder: (
        category: WatchlistCategory,
        order: string[],
    ) => {
        if (
            (category === 'fx' ||
                category === 'crypto' ||
                category === 'metals') &&
            order.includes('USD') &&
            order[0] !== 'USD'
        ) {
            return;
        }

        state = {
            ...state,
            [category]: [...order],
        };

        emit();
    },

    add: (
        category: WatchlistCategory,
        symbol: string,
    ) => {
        if (state[category].includes(symbol)) {
            return;
        }

        state = {
            ...state,
            [category]: [
                ...state[category],
                symbol,
            ],
        };

        emit();
    },

    remove: (
        category: WatchlistCategory,
        symbol: string,
    ) => {
        if (
            (category === 'fx' ||
                category === 'crypto' ||
                category === 'metals') &&
            symbol === 'USD'
        ) {
            return;
        }

        state = {
            ...state,
            [category]: state[category].filter(
                item => item !== symbol,
            ),
        };

        emit();
    },

    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};
