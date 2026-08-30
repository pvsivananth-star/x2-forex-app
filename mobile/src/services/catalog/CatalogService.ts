import type { ICatalogService, CatalogItem } from '../contracts/ICatalogService';
import type { MarketKind } from '../contracts/IRateService';
import {
  CRYPTO_DEFAULT_CATALOG,
  FX_CATALOG,
  METAL_CATALOG,
} from '../../catalogs';
import { EQUITY_ORDER } from '../../catalogs/equities';

export class CatalogService implements ICatalogService {
  getItems(market: MarketKind): CatalogItem[] {
    switch (market) {
      case 'fx':
        return FX_CATALOG.map(item => ({ symbol: item.symbol, name: item.name }));
      case 'crypto':
        return CRYPTO_DEFAULT_CATALOG.map(item => ({ symbol: item.symbol, name: item.name }));
      case 'metals':
        return METAL_CATALOG.map(item => ({ symbol: item.symbol, name: item.name }));
      case 'equity':
        return EQUITY_ORDER.map(item => ({ symbol: item.symbol, name: item.name }));
    }
  }
}
