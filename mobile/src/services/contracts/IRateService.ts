import type {Tenor, FetchedMap} from '../../models';

export type MarketKind = 'fx' | 'crypto' | 'metals' | 'equity';

export interface RateRequest {
  market: MarketKind;
  tenor?: Tenor;
  symbols?: string[];
}

export interface IRateService {
  getRates(request: RateRequest): Promise<FetchedMap>;
  refreshRates(request: RateRequest): Promise<FetchedMap>;
}
