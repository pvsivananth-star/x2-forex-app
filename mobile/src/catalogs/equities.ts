export interface EquityCatalogItem {
  symbol: string;
  name: string;
  country: string;
  priority: number;
}

type EquitySeed = [symbol: string, name: string, country: string, priority: number];

const EQUITY_SEED: EquitySeed[] = [
  ['SPX', 'S&P 500', 'US', 10],
  ['NDX', 'Nasdaq 100', 'US', 20],
  ['DJI', 'Dow Jones', 'US', 30],
  ['RUT', 'Russell 2000', 'US', 40],
  ['FTSE', 'FTSE 100', 'GB', 100],
  ['DAX', 'DAX', 'DE', 110],
  ['CAC', 'CAC 40', 'FR', 120],
  ['NIKKEI', 'Nikkei 225', 'JP', 130],
  ['HSI', 'Hang Seng', 'HK', 140],
  ['SHCOMP', 'Shanghai Composite', 'CN', 150],
  ['SENSEX', 'Sensex', 'IN', 160],
  ['NIFTY50', 'Nifty 50', 'IN', 170],
  ['KOSPI', 'KOSPI', 'KR', 180],
  ['ASX200', 'ASX 200', 'AU', 190],
  ['TSX', 'S&P/TSX Composite', 'CA', 200],
  ['IBOV', 'Bovespa', 'BR', 210],
];

export const EQUITY_ORDER: EquityCatalogItem[] = EQUITY_SEED.map(([symbol, name, country, priority]) => ({
  symbol,
  name,
  country,
  priority,
}));
