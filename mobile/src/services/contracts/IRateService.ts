import type { Tenor } from '../../models';

export type MarketKind = 'fx' | 'crypto' | 'metals' | 'equity';

export interface RateRequest {
  market: MarketKind;
  tenor?: Tenor;
  symbols?: string[];
}

export interface RateData {
  symbol: string;
  rate: number;
  referenceRate: number;
  changePct: number;
}

export interface IRateService {
  getRates(request: RateRequest): Promise<RateData[]>;
  refreshRates(request: RateRequest): Promise<RateData[]>;
}
