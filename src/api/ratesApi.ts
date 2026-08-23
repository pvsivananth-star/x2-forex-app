import { getItem, setItem } from '../storage/mmkv';

// --- TYPE DEFINITIONS ---
export interface RatesMap {
    [currencyCode: string]: number; // Relative to 1 USD
}

export interface CryptoItem {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    total_volume: number;
}

export interface MetalItem {
    id: string;
    symbol: string;
    name: string;
    unit: string;
    priceUsd: number;
    change24h: number;
}

export interface ForexRateMap {
    [currency: string]: number;
}

// --- FALLBACK CONSTANTS ---
const FALLBACK_FOREX: ForexRateMap = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 155.4,
    INR: 83.5,
    AUD: 1.51,
    CAD: 1.36,
    CHF: 0.89,
};

const FALLBACK_CRYPTO: CryptoItem[] = [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 64250.0, price_change_percentage_24h: 2.15, total_volume: 28400000000 },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3480.5, price_change_percentage_24h: -0.85, total_volume: 14200000000 },
    { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.0, price_change_percentage_24h: 0.01, total_volume: 45200000000 },
    { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145.2, price_change_percentage_24h: 4.32, total_volume: 3800000000 },
    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 575.8, price_change_percentage_24h: 1.12, total_volume: 1200000000 },
    { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.58, price_change_percentage_24h: -1.45, total_volume: 950000000 },
    { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.39, price_change_percentage_24h: 0.65, total_volume: 340000000 },
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.12, price_change_percentage_24h: 3.8, total_volume: 780000000 },
    { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 24.5, price_change_percentage_24h: -2.1, total_volume: 290000000 },
    { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin', current_price: 1.0, price_change_percentage_24h: 0.0, total_volume: 6100000000 },
];

const FALLBACK_METALS: MetalItem[] = [
    { id: 'gold-oz', symbol: 'XAU', name: 'Gold Spot', unit: '1 troy oz', priceUsd: 2385.50, change24h: 0.45 },
    { id: 'silver-oz', symbol: 'XAG', name: 'Silver Spot', unit: '1 troy oz', priceUsd: 28.40, change24h: -0.82 },
    { id: 'gold-100g', symbol: 'XAU-100G', name: 'Gold Bar', unit: '100 grams', priceUsd: 7670.00, change24h: 0.45 },
    { id: 'silver-1kg', symbol: 'XAG-1KG', name: 'Silver Bar', unit: '1 kg', priceUsd: 913.00, change24h: -0.82 },
    { id: 'platinum-oz', symbol: 'XPT', name: 'Platinum Spot', unit: '1 troy oz', priceUsd: 960.20, change24h: 1.15 },
    { id: 'palladium-oz', symbol: 'XPD', name: 'Palladium Spot', unit: '1 troy oz', priceUsd: 985.00, change24h: -1.05 },
    { id: 'gold-1kg', symbol: 'XAU-1KG', name: 'Gold Kilobar', unit: '1 kg', priceUsd: 76700.00, change24h: 0.45 },
    { id: 'rhodium-oz', symbol: 'XRH', name: 'Rhodium Spot', unit: '1 troy oz', priceUsd: 4650.00, change24h: 0.10 },
    { id: 'silver-100oz', symbol: 'XAG-100OZ', name: 'Silver Bar', unit: '100 troy oz', priceUsd: 2840.00, change24h: -0.82 },
    { id: 'copper-lb', symbol: 'HG', name: 'Copper Futures', unit: '1 lb', priceUsd: 4.15, change24h: 0.30 },
];

// Generic Yahoo Finance Quotes Batch Fetcher
const fetchYahooQuotes = async (symbols: string[]): Promise<Record<string, { price: number; change: number; volume?: number }>> => {
    const symbolQuery = symbols.join(',');
    const res = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolQuery}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res || !res.ok) return {};

    const json = await res.json();
    const results = json?.quoteResponse?.result || [];

    const map: Record<string, { price: number; change: number; volume?: number }> = {};
    results.forEach((q: any) => {
        if (q.symbol && q.regularMarketPrice !== undefined) {
            map[q.symbol] = {
                price: q.regularMarketPrice,
                change: Number((q.regularMarketChangePercent || 0).toFixed(2)),
                volume: q.regularMarketVolume || 0,
            };
        }
    });

    return map;
};

// --- FOREX (YAHOO FINANCE) ---
export const fetchFiatRates = async (): Promise<RatesMap> => {
    try {
        const fxPairs = ['EURUSD=X', 'GBPUSD=X', 'JPY=X', 'INR=X', 'AUDUSD=X', 'CAD=X', 'CHF=X'];
        const quotes = await fetchYahooQuotes(fxPairs);

        if (Object.keys(quotes).length > 0) {
            const rates: RatesMap = {
                USD: 1.0,
                EUR: quotes['EURUSD=X']?.price ? 1 / quotes['EURUSD=X'].price : FALLBACK_FOREX.EUR,
                GBP: quotes['GBPUSD=X']?.price ? 1 / quotes['GBPUSD=X'].price : FALLBACK_FOREX.GBP,
                JPY: quotes['JPY=X']?.price || FALLBACK_FOREX.JPY,
                INR: quotes['INR=X']?.price || FALLBACK_FOREX.INR,
                AUD: quotes['AUDUSD=X']?.price ? 1 / quotes['AUDUSD=X'].price : FALLBACK_FOREX.AUD,
                CAD: quotes['CAD=X']?.price || FALLBACK_FOREX.CAD,
                CHF: quotes['CHF=X']?.price || FALLBACK_FOREX.CHF,
            };
            return rates;
        }
    } catch (error) {
        console.warn('Yahoo Finance Forex fetch failed, using fallback.', error);
    }
    return FALLBACK_FOREX;
};

export const fetchForexRates = async (baseCurrency = 'USD'): Promise<{ rates: ForexRateMap; isOffline: boolean }> => {
    try {
        const rates = await fetchFiatRates();
        if (rates && Object.keys(rates).length > 1) {
            setItem(`cache_forex_${baseCurrency}`, JSON.stringify(rates));
            return { rates, isOffline: false };
        }
    } catch (err) {
        // Catch fetch error
    }

    const cached = getItem(`cache_forex_${baseCurrency}`);
    if (cached) {
        try {
            return { rates: JSON.parse(cached), isOffline: true };
        } catch (e) {}
    }

    return { rates: FALLBACK_FOREX, isOffline: true };
};

export const fetchAllRates = async (): Promise<{ rates: RatesMap; isOffline: boolean }> => {
    try {
        const fiat = await fetchFiatRates();
        if (fiat && Object.keys(fiat).length > 1) {
            setItem('cached_rates', JSON.stringify(fiat));
            return { rates: fiat, isOffline: false };
        }
    } catch (e) {
        console.warn('Network error during sync, falling back to cached storage.');
    }

    const cached = getItem('cached_rates');
    if (cached) {
        try {
            return { rates: JSON.parse(cached), isOffline: true };
        } catch (e) {}
    }

    return { rates: FALLBACK_FOREX, isOffline: true };
};

// --- CRYPTO (YAHOO FINANCE) ---
export const fetchCryptoRates = async (): Promise<{ data: CryptoItem[]; isOffline: boolean }> => {
    try {
        const cryptoSymbols = [
            'BTC-USD', 'ETH-USD', 'USDT-USD', 'SOL-USD', 'BNB-USD',
            'XRP-USD', 'ADA-USD', 'DOGE-USD', 'AVAX-USD', 'USDC-USD'
        ];

        const quotes = await fetchYahooQuotes(cryptoSymbols);

        if (Object.keys(quotes).length > 0) {
            const cryptoData: CryptoItem[] = [
                { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: quotes['BTC-USD']?.price || 64250, price_change_percentage_24h: quotes['BTC-USD']?.change || 0, total_volume: quotes['BTC-USD']?.volume || 28400000000 },
                { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: quotes['ETH-USD']?.price || 3480, price_change_percentage_24h: quotes['ETH-USD']?.change || 0, total_volume: quotes['ETH-USD']?.volume || 14200000000 },
                { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: quotes['USDT-USD']?.price || 1.0, price_change_percentage_24h: quotes['USDT-USD']?.change || 0, total_volume: quotes['USDT-USD']?.volume || 45200000000 },
                { id: 'solana', symbol: 'sol', name: 'Solana', current_price: quotes['SOL-USD']?.price || 145.2, price_change_percentage_24h: quotes['SOL-USD']?.change || 0, total_volume: quotes['SOL-USD']?.volume || 3800000000 },
                { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: quotes['BNB-USD']?.price || 575.8, price_change_percentage_24h: quotes['BNB-USD']?.change || 0, total_volume: quotes['BNB-USD']?.volume || 1200000000 },
                { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: quotes['XRP-USD']?.price || 0.58, price_change_percentage_24h: quotes['XRP-USD']?.change || 0, total_volume: quotes['XRP-USD']?.volume || 950000000 },
                { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: quotes['ADA-USD']?.price || 0.39, price_change_percentage_24h: quotes['ADA-USD']?.change || 0, total_volume: quotes['ADA-USD']?.volume || 340000000 },
                { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: quotes['DOGE-USD']?.price || 0.12, price_change_percentage_24h: quotes['DOGE-USD']?.change || 0, total_volume: quotes['DOGE-USD']?.volume || 780000000 },
                { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: quotes['AVAX-USD']?.price || 24.5, price_change_percentage_24h: quotes['AVAX-USD']?.change || 0, total_volume: quotes['AVAX-USD']?.volume || 290000000 },
                { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin', current_price: quotes['USDC-USD']?.price || 1.0, price_change_percentage_24h: quotes['USDC-USD']?.change || 0, total_volume: quotes['USDC-USD']?.volume || 6100000000 },
            ];

            setItem('cache_crypto', JSON.stringify(cryptoData));
            return { data: cryptoData, isOffline: false };
        }
    } catch (err) {
        console.warn('Yahoo Finance Crypto fetch failed, using cached storage.', err);
    }

    const cached = getItem('cache_crypto');
    if (cached) {
        try {
            return { data: JSON.parse(cached), isOffline: true };
        } catch (e) {}
    }

    return { data: FALLBACK_CRYPTO, isOffline: true };
};

// --- METALS (YAHOO FINANCE COMMODITIES) ---
export const fetchMetalsRates = async (): Promise<{ data: MetalItem[]; isOffline: boolean }> => {
    try {
        const metalSymbols = ['GC=F', 'SI=F', 'PL=F', 'PA=F', 'HG=F'];
        const quotes = await fetchYahooQuotes(metalSymbols);

        if (Object.keys(quotes).length > 0) {
            const gold = quotes['GC=F']?.price || 2385.50;
            const goldChange = quotes['GC=F']?.change || 0.45;

            const silver = quotes['SI=F']?.price || 28.40;
            const silverChange = quotes['SI=F']?.change || -0.82;

            const platinum = quotes['PL=F']?.price || 960.20;
            const platinumChange = quotes['PL=F']?.change || 1.15;

            const palladium = quotes['PA=F']?.price || 985.00;
            const palladiumChange = quotes['PA=F']?.change || -1.05;

            const copper = quotes['HG=F']?.price || 4.15;
            const copperChange = quotes['HG=F']?.change || 0.30;

            const liveMetals: MetalItem[] = [
                { id: 'gold-oz', symbol: 'XAU', name: 'Gold Spot', unit: '1 troy oz', priceUsd: gold, change24h: goldChange },
                { id: 'silver-oz', symbol: 'XAG', name: 'Silver Spot', unit: '1 troy oz', priceUsd: silver, change24h: silverChange },
                { id: 'gold-100g', symbol: 'XAU-100G', name: 'Gold Bar', unit: '100 grams', priceUsd: Number((gold * 3.21507).toFixed(2)), change24h: goldChange },
                { id: 'silver-1kg', symbol: 'XAG-1KG', name: 'Silver Bar', unit: '1 kg', priceUsd: Number((silver * 32.1507).toFixed(2)), change24h: silverChange },
                { id: 'platinum-oz', symbol: 'XPT', name: 'Platinum Spot', unit: '1 troy oz', priceUsd: platinum, change24h: platinumChange },
                { id: 'palladium-oz', symbol: 'XPD', name: 'Palladium Spot', unit: '1 troy oz', priceUsd: palladium, change24h: palladiumChange },
                { id: 'gold-1kg', symbol: 'XAU-1KG', name: 'Gold Kilobar', unit: '1 kg', priceUsd: Number((gold * 32.1507).toFixed(2)), change24h: goldChange },
                { id: 'rhodium-oz', symbol: 'XRH', name: 'Rhodium Spot', unit: '1 troy oz', priceUsd: 4650.00, change24h: 0.10 },
                { id: 'silver-100oz', symbol: 'XAG-100OZ', name: 'Silver Bar', unit: '100 troy oz', priceUsd: Number((silver * 100).toFixed(2)), change24h: silverChange },
                { id: 'copper-lb', symbol: 'HG', name: 'Copper Futures', unit: '1 lb', priceUsd: copper, change24h: copperChange },
            ];

            setItem('cache_metals', JSON.stringify(liveMetals));
            return { data: liveMetals, isOffline: false };
        }
    } catch (err) {
        console.warn('Yahoo Finance Metals fetch failed, using cached storage.', err);
    }

    const cached = getItem('cache_metals');
    if (cached) {
        try {
            return { data: JSON.parse(cached), isOffline: true };
        } catch (e) {}
    }

    return { data: FALLBACK_METALS, isOffline: true };
};