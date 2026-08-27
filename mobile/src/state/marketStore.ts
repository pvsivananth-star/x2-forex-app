import { useSyncExternalStore } from 'react';
import { DEFAULT_FX } from '../catalogs/currencies';
import { FX_CATALOG } from '../catalogs/currencies';
import { calculateFromAnchor, normalizeBaseRates, RateBase } from '../utils/rateEngine';
import { MarketAsset } from '../models/market';
import { TabCategory } from '../models/settings';

type State = {
  activeTab: TabCategory;
  assets: Record<string, MarketAsset>;
  baseRates: RateBase;
  editedSymbol: string | null;
  editedValues: Record<string, number>;
};

const initialBase: RateBase = normalizeBaseRates(
  Object.fromEntries(FX_CATALOG.map(asset => [asset.symbol, asset.rate])),
);

let state: State = {
  activeTab: 'fx',
  assets: Object.fromEntries(FX_CATALOG.map(asset => [asset.symbol, asset])),
  baseRates: initialBase,
  editedSymbol: null,
  editedValues: {},
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  emit();
}

export const marketStore = {
  get: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setActiveTab: (activeTab: TabCategory) => setState({ activeTab }),

  setBaseRates: (rates: RateBase) => {
    const baseRates = normalizeBaseRates(rates);
    setState({
      baseRates,
      editedSymbol: null,
      editedValues: {},
    });
  },

  setEditedRate: (symbol: string, value: number) => {
    if (symbol === 'USD' || !Number.isFinite(value) || value <= 0) {
      if (symbol === 'USD' && Number.isFinite(value) && value > 0) {
        const calculated = calculateFromAnchor(state.baseRates, 'USD', value);
        setState({
          editedSymbol: 'USD',
          editedValues: Object.fromEntries(calculated.map(x => [x.symbol, x.value])),
        });
      }
      return;
    }

    const calculated = calculateFromAnchor(state.baseRates, symbol, value);
    setState({
      editedSymbol: symbol,
      editedValues: Object.fromEntries(calculated.map(x => [x.symbol, x.value])),
    });
  },

  clearEdit: () => setState({ editedSymbol: null, editedValues: {} }),

  visibleRates: (category: 'fx' | 'crypto' | 'metals' | 'equity') => {
    const symbols = category === 'fx' ? DEFAULT_FX : Object.keys(state.assets).filter(
      symbol => state.assets[symbol]?.category === category,
    );

    return symbols
      .map(symbol => {
        const asset = state.assets[symbol];
        if (!asset) return null;
        const value = state.editedValues[symbol] ?? asset.rate;
        return { ...asset, rate: value };
      })
      .filter(Boolean) as MarketAsset[];
  },
};

export function useMobileStore<T>(selector: (s: State & typeof marketStore) => T): T {
  return selector(
    Object.assign(state, {
      get: marketStore.get,
      subscribe: marketStore.subscribe,
      setActiveTab: marketStore.setActiveTab,
      setBaseRates: marketStore.setBaseRates,
      setEditedRate: marketStore.setEditedRate,
      clearEdit: marketStore.clearEdit,
      visibleRates: marketStore.visibleRates,
    }) as State & typeof marketStore,
  );
}

export function useMarketStore<T>(selector: (s: State) => T): T {
  return selector(state);
}

export function useStoreSnapshot(): State {
  return useSyncExternalStore(marketStore.subscribe, marketStore.get, marketStore.get);
}
