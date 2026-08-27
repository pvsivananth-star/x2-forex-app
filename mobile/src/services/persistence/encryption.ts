import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.x2.mobile.encryption';

export async function getOrCreateEncryptionKey(): Promise<string> {
  const existing = await Keychain.getGenericPassword({ service: SERVICE });
  if (existing && existing.password) return existing.password;

  const bytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  const key = bytes.map(b => b.toString(16).padStart(2, '0')).join('');

  await Keychain.setGenericPassword('x2', key, {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  return key;
}

/**
 * Persistence boundary.
 *
 * The key is held by iOS Keychain / Android Keystore through Keychain.
 * The application must never hard-code an encryption key or export it.
 *
 * AES-GCM should be provided here by the platform crypto implementation
 * used by the final mobile build.
 */
export interface EncryptionProvider {
  encrypt(plainText: string, key: string): Promise<string>;
  decrypt(cipherText: string, key: string): Promise<string>;
}

let provider: EncryptionProvider | null = null;

export function configureEncryption(next: EncryptionProvider) {
  provider = next;
}

export async function encrypt(plainText: string): Promise<string> {
  if (!provider) throw new Error('Encryption provider is not configured');
  return provider.encrypt(plainText, await getOrCreateEncryptionKey());
}

export async function decrypt(cipherText: string): Promise<string> {
  if (!provider) throw new Error('Encryption provider is not configured');
  return provider.decrypt(cipherText, await getOrCreateEncryptionKey());
}
