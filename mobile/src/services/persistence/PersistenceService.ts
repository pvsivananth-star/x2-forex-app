import type {IPersistenceService} from '../contracts/IPersistenceService';
import {
  clearMobileState,
  loadMobileState,
  saveMobileState,
} from './mobileStateStorage';
import type {StoredMobileState} from './mobileStateStorage';
import type {PersistedSettings} from '../../models';

export class PersistenceService implements IPersistenceService<StoredMobileState> {
  async load(): Promise<StoredMobileState | null> {
    return loadMobileState();
  }

  async save(state: PersistedSettings): Promise<void> {
    await saveMobileState(state);
  }

  async clear(): Promise<void> {
    await clearMobileState();
  }
}
