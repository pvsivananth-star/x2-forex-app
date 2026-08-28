import {MarketAsset,} from './types';

export const TENOR_OPTIONS = [
    '1D',
    '1W',
    '1M',
    '3M',
    '6M',
    '1Y',
] as const;

export const REFRESH_INTERVAL_SECONDS =
    180;

export const FX_CATALOG: MarketAsset[] = [
    {
        symbol: 'USD',
        name: 'US Dollar',
        rate: 1,
        changePct: 0,
        referenceRate: 1,
        category: 'fx',
    },
    {
        symbol: 'EUR',
        name: 'Euro',
        rate: 1.08,
        changePct: 0,
        referenceRate: 1.08,
        category: 'fx',
    },
    {
        symbol: 'JPY',
        name: 'Japanese Yen',
        rate: 155,
        changePct: 0,
        referenceRate: 155,
        category: 'fx',
    },
    {
        symbol: 'GBP',
        name: 'British Pound',
        rate: 1.26,
        changePct: 0,
        referenceRate: 1.26,
        category: 'fx',
    },
    {
        symbol: 'CAD',
        name: 'Canadian Dollar',
        rate: 1.36,
        changePct: 0,
        referenceRate: 1.36,
        category: 'fx',
    },
    {
        symbol: 'AUD',
        name: 'Australian Dollar',
        rate: 0.65,
        changePct: 0,
        referenceRate: 0.65,
        category: 'fx',
    },
    {
        symbol: 'CHF',
        name: 'Swiss Franc',
        rate: 0.88,
        changePct: 0,
        referenceRate: 0.88,
        category: 'fx',
    },
    {
        symbol: 'CNY',
        name: 'Chinese Yuan',
        rate: 7.18,
        changePct: 0,
        referenceRate: 7.18,
        category: 'fx',
    },
    {
        symbol: 'SEK',
        name: 'Swedish Krona',
        rate: 10.1,
        changePct: 0,
        referenceRate: 10.1,
        category: 'fx',
    },
    {
        symbol: 'NOK',
        name: 'Norwegian Krone',
        rate: 10.4,
        changePct: 0,
        referenceRate: 10.4,
        category: 'fx',
    },
    {
        symbol: 'NZD',
        name: 'New Zealand Dollar',
        rate: 0.61,
        changePct: 0,
        referenceRate: 0.61,
        category: 'fx',
    },
    {
        symbol: 'SGD',
        name: 'Singapore Dollar',
        rate: 1.28,
        changePct: 0,
        referenceRate: 1.28,
        category: 'fx',
    },
    {
        symbol: 'HKD',
        name: 'Hong Kong Dollar',
        rate: 7.8,
        changePct: 0,
        referenceRate: 7.8,
        category: 'fx',
    },
    {
        symbol: 'INR',
        name: 'Indian Rupee',
        rate: 87,
        changePct: 0,
        referenceRate: 87,
        category: 'fx',
    },
    {
        symbol: 'ZAR',
        name: 'South African Rand',
        rate: 18.2,
        changePct: 0,
        referenceRate: 18.2,
        category: 'fx',
    },
    {
        symbol: 'BRL',
        name: 'Brazilian Real',
        rate: 5.5,
        changePct: 0,
        referenceRate: 5.5,
        category: 'fx',
    },
    {
        symbol: 'MXN',
        name: 'Mexican Peso',
        rate: 19.1,
        changePct: 0,
        referenceRate: 19.1,
        category: 'fx',
    },
    {
        symbol: 'PLN',
        name: 'Polish Zloty',
        rate: 3.9,
        changePct: 0,
        referenceRate: 3.9,
        category: 'fx',
    },
    {
        symbol: 'DKK',
        name: 'Danish Krone',
        rate: 6.6,
        changePct: 0,
        referenceRate: 6.6,
        category: 'fx',
    },
    {
        symbol: 'THB',
        name: 'Thai Baht',
        rate: 32.5,
        changePct: 0,
        referenceRate: 32.5,
        category: 'fx',
    },
];

export const DEFAULT_FX = [
    'USD',
    'EUR',
    'JPY',
    'GBP',
    'CAD',
    'AUD',
    'CHF',
    'CNY',
    'SEK',
    'NOK',
];

export const DEFAULT_EQUITY = [
    'SPX',
    'NDX',
    'DJI',
    'RUT',
    'FTSE',
    'DAX',
    'CAC',
    'NIKKEI',
    'HSI',
    'SHCOMP',
    'SENSEX',
    'NIFTY50',
    'KOSPI',
    'ASX200',
    'TSX',
    'IBOV',
];
export const CRYPTO_DEFAULT_CATALOG: MarketAsset[] = [
    {
        symbol: 'bitcoin',
        displaySymbol: 'BTC',
        name: 'Bitcoin',
        id: 'bitcoin',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
    {
        symbol: 'ethereum',
        displaySymbol: 'ETH',
        name: 'Ethereum',
        id: 'ethereum',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
    {
        symbol: 'tether',
        displaySymbol: 'USDT',
        name: 'Tether',
        id: 'tether',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
    {
        symbol: 'binancecoin',
        displaySymbol: 'BNB',
        name: 'BNB',
        id: 'binancecoin',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
    {
        symbol: 'solana',
        displaySymbol: 'SOL',
        name: 'Solana',
        id: 'solana',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
    {
        symbol: 'ripple',
        displaySymbol: 'XRP',
        name: 'XRP',
        id: 'ripple',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
    {
        symbol: 'usd-coin',
        displaySymbol: 'USDC',
        name: 'USDC',
        id: 'usd-coin',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
    {
        symbol: 'dogecoin',
        displaySymbol: 'DOGE',
        name: 'Dogecoin',
        id: 'dogecoin',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
    {
        symbol: 'cardano',
        displaySymbol: 'ADA',
        name: 'Cardano',
        id: 'cardano',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
    {
        symbol: 'avalanche-2',
        displaySymbol: 'AVAX',
        name: 'Avalanche',
        id: 'avalanche-2',
        rate: 0,
        changePct: 0,
        category: 'crypto',
    },
];

export const DEFAULT_CRYPTO = [
    'USD',
    'bitcoin',
];

export const METAL_CATALOG: MarketAsset[] = [
    {
        symbol: 'XAU_1OZ',
        name: 'Gold · 1 Troy Oz',
        rate: 2350,
        changePct: 0,
        referenceRate: 2350,
        category: 'metals',
    },
    {
        symbol: 'XAG_1OZ',
        name: 'Silver · 1 Troy Oz',
        rate: 28,
        changePct: 0,
        referenceRate: 28,
        category: 'metals',
    },
    {
        symbol: 'XPT_1OZ',
        name: 'Platinum · 1 Troy Oz',
        rate: 985,
        changePct: 0,
        referenceRate: 985,
        category: 'metals',
    },
    {
        symbol: 'XPD_1OZ',
        name: 'Palladium · 1 Troy Oz',
        rate: 1020,
        changePct: 0,
        referenceRate: 1020,
        category: 'metals',
    },
    {
        symbol: 'XRH_1OZ',
        name: 'Rhodium · 1 Troy Oz',
        rate: 4500,
        changePct: 0,
        referenceRate: 4500,
        category: 'metals',
    },
    {
        symbol: 'XCU_1LB',
        name: 'Copper · 1 lb',
        rate: 4.35,
        changePct: 0,
        referenceRate: 4.35,
        category: 'metals',
    },
    {
        symbol: 'XAL_1LB',
        name: 'Aluminium · 1 lb',
        rate: 1.1,
        changePct: 0,
        referenceRate: 1.1,
        category: 'metals',
    },
    {
        symbol: 'XNI_1LB',
        name: 'Nickel · 1 lb',
        rate: 7.5,
        changePct: 0,
        referenceRate: 7.5,
        category: 'metals',
    },
    {
        symbol: 'XZN_1LB',
        name: 'Zinc · 1 lb',
        rate: 1.2,
        changePct: 0,
        referenceRate: 1.2,
        category: 'metals',
    },
    {
        symbol: 'XPB_1LB',
        name: 'Lead · 1 lb',
        rate: 0.95,
        changePct: 0,
        referenceRate: 0.95,
        category: 'metals',
    },
];

export const DEFAULT_METALS = [
    'USD',
    ...METAL_CATALOG.map(
        (asset) => asset.symbol,
    ),
];

export const ALL_STATIC_CATALOG = [
    ...FX_CATALOG,
    ...CRYPTO_DEFAULT_CATALOG,
    ...METAL_CATALOG,
];

export function getStaticCatalog(
    category:
        | 'fx'
        | 'crypto'
        | 'metals',
): MarketAsset[] {
    if (category === 'fx') {
        return FX_CATALOG;
    }

    if (category === 'metals') {
        return METAL_CATALOG;
    }

    return CRYPTO_DEFAULT_CATALOG;
}