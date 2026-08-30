import type { IPersistenceService } from '../contracts/IPersistenceService';
import {
  clearMobileState,
  loadMobileState,
  saveMobileState,
} from './mobileStateStorage';
import type { PersistedSettings } from '../../models';

export class PersistenceService implements IPersistenceService<PersistedSettings> {
  async load(): Promise<PersistedSettings | null> {
    return loadMobileState();
  }

  async save(state: PersistedSettings): Promise<void> {
    await saveMobileState(state);
  }

  async clear(): Promise<void> {
    await clearMobileState();
  }
}
