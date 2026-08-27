import { MarketAsset, MarketState } from '../models/market';

let state: MarketState = { assets: {}, marketRates: {}, lastSynced: 0, isOnline: true, isLoading: false };
const listeners = new Set<() => void>();

export const marketStore = {
  get: () => state,
  set: (next: Partial<MarketState>) => { state = { ...state, ...next }; listeners.forEach(x => x()); },
  subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); },
  setAssets: (assets: Record<string, MarketAsset>) => { state = { ...state, assets }; listeners.forEach(x => x()); },
};
