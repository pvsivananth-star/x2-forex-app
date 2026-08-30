import type {
  IRateService,
  MarketKind,
  RateData,
  RateRequest,
} from '../contracts/IRateService';
import type { Tenor } from '../../models';
import {
  fetchCryptoForMobileService,
  fetchEquityForMobileService,
  fetchFxForMobileService,
  fetchMetalsForMobileService,
} from './mobileServiceAdapters';

const DEFAULT_TENOR: Tenor = '1D';

function toRateData(
  values: Record<string, {
    rate: number;
    referenceRate: number;
    changePct: number;
  }>,
): RateData[] {
  return Object.entries(values).map(([symbol, value]) => ({
    symbol,
    rate: value.rate,
    referenceRate: value.referenceRate,
    changePct: value.changePct,
  }));
}

export class RateService implements IRateService {
  async getRates(request: RateRequest): Promise<RateData[]> {
    return this.fetch(request);
  }

  async refreshRates(request: RateRequest): Promise<RateData[]> {
    return this.fetch(request);
  }

  private async fetch(request: RateRequest): Promise<RateData[]> {
    const tenor = request.tenor ?? DEFAULT_TENOR;

    let result: Awaited<ReturnType<typeof fetchFxForMobileService>>;

    switch (request.market as MarketKind) {
      case 'fx':
        result = await fetchFxForMobileService(tenor);
        break;
      case 'crypto':
        result = await fetchCryptoForMobileService(tenor, request.symbols ?? []);
        break;
      case 'metals':
        result = await fetchMetalsForMobileService(tenor);
        break;
      case 'equity':
        result = await fetchEquityForMobileService();
        break;
    }

    const data = toRateData(result);
    return request.symbols?.length
      ? data.filter(item => request.symbols!.includes(item.symbol))
      : data;
  }
}
