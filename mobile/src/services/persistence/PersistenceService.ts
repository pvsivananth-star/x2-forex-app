import type {IPersistenceService} from '../contracts/IPersistenceService';
import {
  clearMobileState,
  loadMobileState,
  saveMobileState,
} from './mobileStateStorage';
import type {StoredMobileState} from './mobileStateStorage';
import {DEFAULT_CRYPTO} from '../../catalogs/crypto';

export class PersistenceService implements IPersistenceService<StoredMobileState> {
  async load(): Promise<StoredMobileState | null> {
    const state = await loadMobileState();

    if (!state) {
      return null;
    }

    // Migrate the old initial crypto watchlist (USD + BTC) to the current
    // full default catalog. Genuine user customizations are preserved.
    const crypto = state.watchlistCrypto ?? [];
    const isLegacyCryptoDefault =
      crypto.length === 2 &&
      crypto.includes('USD') &&
      crypto.includes('bitcoin');

    if (!isLegacyCryptoDefault) {
      return state;
    }

    const migrated: StoredMobileState = {
      ...state,
      watchlistCrypto: [...DEFAULT_CRYPTO],
    };

    await saveMobileState(migrated);
    return migrated;
  }

  async save(state: StoredMobileState): Promise<void> {
    await saveMobileState(state);
  }

  async clear(): Promise<void> {
    await clearMobileState();
  }
}
