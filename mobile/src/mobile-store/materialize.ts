import { getCategoryState } from './helpers';
import type { MobileServiceState, MarketSnapshot } from './types';
import type { Category } from '../utils/rateEngine';

import { calculateAnchor } from '../utils/rateEngine';
import { services } from '../services/serviceContainer';

import type { PersistedMarketState, PersistedSettings } from '../models';

export function materializeCategory(
    category: Category,
): {
    assets: Record<string, any>;
    editedRates: Record<string, number>;
    marketRates: Record<string, MarketSnapshot>;
} {
    const state =
        getCategoryState(category);

    return {
        assets: Object.fromEntries(
            Object.entries(state.assets).map(([k, a]) => [k, { ...a, value: a.rate }]),
        ),

        editedRates:
            state.editedSymbol &&
            state.editedValue !== null
                ? {
                    [state.editedSymbol]:
                    state.editedValue,
                }
                : {},

        marketRates: {
            ...state.marketRates,
        },
    };
}

export function materializeActiveCategory(
    state: MobileServiceState,
): Partial<MobileServiceState> {
    const category =
        // categoryForTab is defined in utils/rateEngine in original codebase
        // but importing here would create a dependency cycle later when moving the store.
        // To keep this module focused, call categoryForTab dynamically from outside when needed.
        (state as any).activeTab && (state as any).activeTab ? (state as any).activeTab : null;

    if (!category) {
        return {};
    }

    return materializeCategory(
        category as Category,
    );
}

export async function persistState(
    state: MobileServiceState,
): Promise<void> {
    const persistedMarkets:
        PersistedMarketState = {
        fx: {
            symbol:
            getCategoryState('fx').editedSymbol,

            value:
            getCategoryState('fx').editedValue,
        },

        crypto: {
            symbol:
            getCategoryState('crypto').editedSymbol,

            value:
            getCategoryState('crypto').editedValue,
        },

        metals: {
            symbol:
            getCategoryState('metals').editedSymbol,

            value:
            getCategoryState('metals').editedValue,
        },
    };

    const settings: PersistedSettings & {
        marketState?: PersistedMarketState;
    } = {
        activeTab:
        state.activeTab,

        tenorFx:
        state.tenorFx,

        tenorCrypto:
        state.tenorCrypto,

        tenorMetals:
        state.tenorMetals,

        decimalPlaces:
        state.decimalPlaces,

        theme:
        state.theme,

        watchlistFx: [
            'USD',
            ...state.watchlistFx.filter(
                symbol =>
                    symbol !== 'USD',
            ),
        ],

        watchlistEquity: [
            ...state.watchlistEquity,
        ],

        watchlistCrypto: [
            'USD',
            ...state.watchlistCrypto.filter(
                symbol =>
                    symbol !== 'USD',
            ),
        ],

        watchlistMetals: [
            'USD',
            ...state.watchlistMetals.filter(
                symbol =>
                    symbol !== 'USD',
            ),
        ],

        editedRates:
        state.editedRates,

        marketState:
        persistedMarkets,
    };

    await services.persistence.save(
        settings,
    );
}
