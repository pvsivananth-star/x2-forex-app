import { MarketAsset } from '../models';

export const METAL_CATALOG: MarketAsset[] = [
  ['XAU_1OZ','Gold · 1 Troy Oz',2350], ['XAG_1OZ','Silver · 1 Troy Oz',28],
  ['XPT_1OZ','Platinum · 1 Troy Oz',985], ['XPD_1OZ','Palladium · 1 Troy Oz',1020],
  ['XRH_1OZ','Rhodium · 1 Troy Oz',4500], ['XCU_1LB','Copper · 1 lb',4.35],
  ['XAL_1LB','Aluminium · 1 lb',1.1], ['XNI_1LB','Nickel · 1 lb',7.5],
  ['XZN_1LB','Zinc · 1 lb',1.2], ['XPB_1LB','Lead · 1 lb',0.95],
].map(([symbol, name, rate]: [string, string, number]) => ({
  symbol,
  name,
  rate,
  changePct: 0,
  referenceRate: rate,
  category: 'metals' as const,
}));

export const DEFAULT_METALS = METAL_CATALOG.map(x => x.symbol);
