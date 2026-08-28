import {ExportEnvelope} from '../../models/export';
import {decrypt} from './encryption';

export async function importApplicationData(
    encryptedPayload: string,
): Promise<ExportEnvelope> {
    const parsed: unknown = JSON.parse(await decrypt(encryptedPayload));

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid X2 export');
    }

    const value = parsed as Partial<ExportEnvelope>;
    
    if (value.schemaVersion !== 1) {
        throw new Error('Unsupported X2 export version');
    }

    if (typeof value.exportedAt !== 'number') {
        throw new Error('Invalid X2 export timestamp');
    }

    if (value.settings === undefined ||
        value.watchlist === undefined ||
        value.portfolio === undefined) {
        throw new Error('Incomplete X2 export');
    }

    return value as ExportEnvelope;
}
