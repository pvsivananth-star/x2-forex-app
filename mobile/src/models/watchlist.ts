export type WatchlistCategory = 'fx' | 'crypto' | 'metals' | 'equity';

export interface WatchlistState {
    fx: string[];
    crypto: string[];
    metals: string[];
    equity: string[];
}
