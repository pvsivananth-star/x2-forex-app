import {MarketAsset} from '../models';

type FxSeed = [symbol: string, name: string, rate: number];

const FX_SEED: FxSeed[] = [
  ['USD', 'US Dollar', 1],
  ['EUR', 'Euro', 1.08],
  ['JPY', 'Japanese Yen', 155],
  ['GBP', 'British Pound', 1.26],
  ['CAD', 'Canadian Dollar', 1.36],
  ['AUD', 'Australian Dollar', 0.65],
  ['CHF', 'Swiss Franc', 0.88],
  ['CNY', 'Chinese Yuan', 7.18],
  ['SEK', 'Swedish Krona', 10.1],
  ['NOK', 'Norwegian Krone', 10.4],
  ['NZD', 'New Zealand Dollar', 0.61],
  ['SGD', 'Singapore Dollar', 1.28],
  ['HKD', 'Hong Kong Dollar', 7.8],
  ['INR', 'Indian Rupee', 87],
  ['ZAR', 'South African Rand', 18.2],
  ['BRL', 'Brazilian Real', 5.5],
  ['MXN', 'Mexican Peso', 19.1],
  ['PLN', 'Polish Zloty', 3.9],
  ['DKK', 'Danish Krone', 6.6],
  ['THB', 'Thai Baht', 32.5],
];

export const FX_CATALOG: MarketAsset[] = FX_SEED.map(([symbol, name, rate]) => ({
  symbol,
  name,
  rate,
  changePct: 0,
  referenceRate: rate,
  category: 'fx' as const,
}));

export const DEFAULT_FX = ['USD', 'EUR', 'JPY', 'GBP', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NOK'];
