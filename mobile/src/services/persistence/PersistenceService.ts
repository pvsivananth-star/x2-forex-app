import type { IPersistenceService } from '../contracts/IPersistenceService';
import {
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
    // The existing persistence boundary has no clear operation yet.
    // Keep the contract explicit without changing current behavior.
    throw new Error('Persistence clear is not implemented');
  }
}
