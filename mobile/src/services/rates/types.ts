import {MarketAsset} from '../../models/market';

export interface MarketResult {
    data: MarketAsset[];
    isOffline: boolean;
    timestamp: number;
}
