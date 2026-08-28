import { MarketAsset } from '../../models';

export interface MarketResult {
    data: MarketAsset[];
    isOffline: boolean;
    timestamp: number;
}
