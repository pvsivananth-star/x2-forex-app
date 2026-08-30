import type {IRateService} from './IRateService';

export class RateService implements IRateService {
    async refreshRates(category: any, tenor: any): Promise<any> {
        throw new Error('Temporary restore placeholder');
    }
}
