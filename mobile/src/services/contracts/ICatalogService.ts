import type { MarketKind } from "./IRateService";

export interface CatalogItem {
  symbol: string;
  name: string;
}

export interface ICatalogService {
  getItems(market: MarketKind): CatalogItem[];
}
