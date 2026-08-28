export type WatchlistCategory = 'fx' | 'crypto' | 'metals';

export interface WatchlistState {
    fx: string[];
    crypto: string[];
    metals: string[];
}
