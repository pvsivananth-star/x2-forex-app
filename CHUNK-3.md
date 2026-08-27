# X2 V2 — Chunk 3

This chunk contains the persistence/security and utility layer.

## Included

- Storage abstraction
- Secure encrypted storage boundary
- Keychain-backed encryption key
- Versioned encrypted export
- Versioned validated import
- Portfolio persistence service
- Rate calculation utilities
- Validation utilities

## Important dependency

`react-native-keychain` is required for the secure key boundary.

The encryption provider is intentionally injected because the final AES-GCM implementation must use the project's selected native crypto implementation. Do not replace it with a hard-coded key or plaintext fallback.

## Migration

The existing branch currently persists settings through AsyncStorage. V2 moves user-owned data behind the persistence service so the UI/state layer does not know how data is stored.

Do not delete the existing persistence code until the state migration is complete and the application has been tested.

## GitHub

No files are written to GitHub by this generation.
