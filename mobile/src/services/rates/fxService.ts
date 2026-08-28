import {FX_CATALOG} from '../../catalogs/currencies';
import {MarketAsset, Tenor} from '../../models';
import {MarketResult} from './types';

const TENOR_DAYS: Record<Tenor, number> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
};

const FX_SYMBOLS = FX_CATALOG.map(
    asset => asset.symbol,
).filter(symbol => symbol !== 'USD');

function isoDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
}

function percentageChange(
    current: number,
    reference: number,
): number {
    if (
        !Number.isFinite(current) ||
        !Number.isFinite(reference) ||
        reference === 0
    ) {
        return 0;
    }

    return Number(
        (((current - reference) / reference) * 100).toFixed(2),
    );
}

async function fetchFxRatesFromProvider(
    tenor: Tenor,
): Promise<Record<string, {
    rate: number;
    referenceRate: number;
    changePct: number;
}>> {
    const currencies = FX_SYMBOLS.join(',');

    const result: Record<string, {
        rate: number;
        referenceRate: number;
        changePct: number;
    }> = {
        USD: {
            rate: 1,
            referenceRate: 1,
            changePct: 0,
        },
    };

    const [currentResponse, historicalResponse] =
        await Promise.all([
            fetch(
                `https://api.frankfurter.app/latest?from=USD&to=${currencies}`,
            ),
            fetch(
                `https://api.frankfurter.app/${isoDaysAgo(
                    TENOR_DAYS[tenor],
                )}?from=USD&to=${currencies}`,
            ),
        ]);

    if (!currentResponse.ok) {
        throw new Error('Current FX request failed');
    }

    const current = await currentResponse.json();
    const historical = historicalResponse.ok
        ? await historicalResponse.json()
        : {};

    Object.entries(current?.rates ?? {}).forEach(
        ([symbol, currentRaw]) => {
            if (
                typeof currentRaw !== 'number' ||
                !Number.isFinite(currentRaw) ||
                currentRaw <= 0
            ) {
                return;
            }

            const historicalRaw = historical?.rates?.[symbol];
            const referenceRate =
                typeof historicalRaw === 'number' &&
                Number.isFinite(historicalRaw) &&
                historicalRaw > 0
                    ? historicalRaw
                    : currentRaw;

            result[symbol] = {
                rate: Number(currentRaw.toFixed(8)),
                referenceRate: Number(
                    referenceRate.toFixed(8),
                ),
                changePct: percentageChange(
                    currentRaw,
                    referenceRate,
                ),
            };
        },
    );

    return result;
}

export async function fetchFxRates(
    tenor: Tenor,
): Promise<MarketResult> {
    try {
        const fetched =
            await fetchFxRatesFromProvider(tenor);

        const data: MarketAsset[] = FX_CATALOG
            .map(asset => {
                const quote = fetched[asset.symbol];

                if (!quote) {
                    return null;
                }

                return {
                    ...asset,
                    rate: quote.rate,
                    referenceRate: quote.referenceRate,
                    changePct: quote.changePct,
                };
            })
            .filter(
                (asset): asset is MarketAsset =>
                    asset !== null,
            );

        return {
            data,
            isOffline: data.length === 0,
            timestamp: Date.now(),
        };
    } catch {
        return {
            data: [],
            isOffline: true,
            timestamp: Date.now(),
        };
    }
}
