// Compatibility declarations for the native dependency used by persistence/encryption.
// The runtime dependency is declared in the root package.json.
declare module 'react-native-keychain' {
    export const ACCESSIBLE: {
        WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
    };

    export function getGenericPassword(options?: {service?: string}): Promise<{username: string; password: string} | false>;
    export function setGenericPassword(username: string, password: string, options?: {service?: string; accessible?: string}): Promise<unknown>;
}
