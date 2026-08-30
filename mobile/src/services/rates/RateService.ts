import type {
  IRateService,
  MarketKind,
  RateRequest,
} from '../contracts/IRateService';
import type {FetchedMap, Tenor} from '../../models';
import {
  fetchCryptoForMobileService,
  fetchEquityForMobileService,
  fetchFxForMobileService,
  fetchMetalsForMobileService,
} from './mobileServiceAdapters';

const DEFAULT_TENOR: Tenor = '1D';

export class RateService implements IRateService {
  async getRates(request: RateRequest): Promise<FetchedMap> {
    return this.fetch(request);
  }

  async refreshRates(request: RateRequest): Promise<FetchedMap> {
    return this.fetch(request);
  }

  private async fetch(request: RateRequest): Promise<FetchedMap> {
    const tenor = request.tenor ?? DEFAULT_TENOR;

    let result: FetchedMap;

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
      default:
        result = {};
    }

    if (!request.symbols?.length) {
      return result;
    }

    return Object.fromEntries(
      Object.entries(result).filter(([symbol]) => request.symbols!.includes(symbol)),
    );
  }
}
