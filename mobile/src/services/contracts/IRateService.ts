export type MarketKind = "fx" | "crypto" | "metals" | "equity";

export interface RateRequest {
  market: MarketKind;
  symbols?: string[];
}

export interface RateData {
  symbol: string;
  rate: number;
}

export interface IRateService {
  getRates(request: RateRequest): Promise<RateData[]>;
  refreshRates(request: RateRequest): Promise<RateData[]>;
}
