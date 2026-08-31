import {MarketAsset} from '../models';

export const CRYPTO_DEFAULT_CATALOG: MarketAsset[] = [
    ['bitcoin', 'BTC', 'Bitcoin'],
    ['ethereum', 'ETH', 'Ethereum'],
    ['tether', 'USDT', 'Tether'],
    ['binancecoin', 'BNB', 'BNB'],
    ['solana', 'SOL', 'Solana'],
    ['ripple', 'XRP', 'XRP'],
    ['usd-coin', 'USDC', 'USDC'],
    ['dogecoin', 'DOGE', 'Dogecoin'],
    ['cardano', 'ADA', 'Cardano'],
    ['avalanche-2', 'AVAX', 'Avalanche'],
].map(([id, displaySymbol, name]) => ({
    symbol: id as string,
    id: id as string,
    displaySymbol: displaySymbol as string,
    name: name as string,
    rate: 0,
    changePct: 0,
    category: 'crypto',
}));

export const DEFAULT_CRYPTO = [
    'USD',
    ...CRYPTO_DEFAULT_CATALOG.map(
        asset => asset.symbol,
    ),
];
