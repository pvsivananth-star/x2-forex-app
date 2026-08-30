import type {IRateService} from './contracts/IRateService';
import type {IPersistenceService} from './contracts/IPersistenceService';
import type {ICatalogService} from './contracts/ICatalogService';
import {RateService} from './rates/RateService';
import {PersistenceService} from './persistence/PersistenceService';
import type {StoredMobileState} from './persistence/mobileStateStorage';
import {CatalogService} from './catalog/CatalogService';
import type {PersistedSettings} from '../models';

export interface ApplicationServices {
    rates: IRateService;
    persistence: IPersistenceService<StoredMobileState>;
    catalog: ICatalogService;
}

/*
 * Composition root.
 *
 * Application callers depend on the interfaces above. Provider/storage
 * implementations are selected here so replacing a service does not require
 * changing its callers.
 */
export const services: ApplicationServices = {
    rates: new RateService(),
    persistence: new PersistenceService(),
    catalog: new CatalogService(),
};
