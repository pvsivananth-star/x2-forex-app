import {ExportEnvelope} from '../../models/export';
import {encrypt} from './encryption';

export async function exportApplicationData(payload: {
    settings: unknown;
    watchlist: unknown;
    portfolio: unknown;
}): Promise<string> {
    const envelope: ExportEnvelope = {
        schemaVersion: 1,
        exportedAt: Date.now(),
        ...payload,
    };

    return encrypt(JSON.stringify(envelope));
}
