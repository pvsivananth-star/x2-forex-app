import type {
  IRateService,
  MarketKind,
  RateRequest,
} from '../contracts/IRateService';
import type {FetchedMap, MarketResult, Tenor} from '../../models';
import {
  fetchCryptoRates,
  fetchEquityRates,
  fetchFxRates,
  fetchMetalsRates,
} from './';

const DEFAULT_TENOR: Tenor = '1D';

function toFetchedMap(result: MarketResult): FetchedMap {
  return Object.fromEntries(
    result.data.map(asset => [
      asset.symbol,
      {
        rate: asset.rate,
        referenceRate: asset.referenceRate ?? asset.rate,
        changePct: asset.changePct,
      },
    ]),
  );
}

export class RateService implements IRateService {
  async getRates(request: RateRequest): Promise<FetchedMap> {
    return this.fetch(request);
  }

  async refreshRates(request: RateRequest): Promise<FetchedMap> {
    return this.fetch(request);
  }

  private async fetch(request: RateRequest): Promise<FetchedMap> {
    const tenor = request.tenor ?? DEFAULT_TENOR;

    let result: MarketResult;

    switch (request.market as MarketKind) {
      case 'fx':
        result = await fetchFxRates(tenor);
        break;
      case 'crypto':
        result = await fetchCryptoRates(tenor, request.symbols ?? []);
        break;
      case 'metals':
        result = await fetchMetalsRates(tenor);
        break;
      case 'equity':
        result = await fetchEquityRates();
        break;
      default:
        result = {data: [], isOffline: true, timestamp: Date.now()};
    }

    const fetched = toFetchedMap(result);

    if (!request.symbols?.length) {
      return fetched;
    }

    return Object.fromEntries(
      Object.entries(fetched).filter(([symbol]) =>
        request.symbols!.includes(symbol),
      ),
    );
  }
}
