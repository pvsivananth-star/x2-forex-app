import {MarketAsset} from '../models';

export const CRYPTO_DEFAULT_CATALOG: MarketAsset[] = [
    ['bitcoin', 'BTC', 'Bitcoin'],
    ['ethereum', 'ETH', 'Ethereum'],
    ['tether', 'USDT', 'Tether'],
    ['solana', 'SOL', 'Solana'],
    ['binancecoin', 'BNB', 'BNB'],
    ['ripple', 'XRP', 'XRP'],
    ['cardano', 'ADA', 'Cardano'],
    ['dogecoin', 'DOGE', 'Dogecoin'],
    ['avalanche-2', 'AVAX', 'Avalanche'],
    ['usd-coin', 'USDC', 'USDC'],
].map(([id, displaySymbol, name]) => ({
    symbol: id as string,
    id: id as string,
    displaySymbol: displaySymbol as string,
    name: name as string,
    rate: 0,
    changePct: 0,
    category: 'crypto' as const,
}));

export const DEFAULT_CRYPTO = [
    'USD',
    ...CRYPTO_DEFAULT_CATALOG.map(asset => asset.symbol),
];
