import {CryptoCatalogItem} from '../../models';

const COINGECKO_BASE =
    'https://api.coingecko.com/api/v3';

const COINGECKO_API_KEY =
    process.env.EXPO_PUBLIC_COINGECKO_API_KEY ?? '';

function coinGeckoHeaders(): Record<string, string> {
    if (!COINGECKO_API_KEY) {
        return {};
    }

    return {
        'x-cg-demo-api-key':
            COINGECKO_API_KEY,
    };
}

let catalogCache:
    CryptoCatalogItem[] | null =
    null;

let catalogPromise:
    Promise<CryptoCatalogItem[]> | null =
    null;

export async function fetchCryptoCatalog(): Promise<
    CryptoCatalogItem[]
> {
    if (catalogCache) {
        return catalogCache;
    }

    if (catalogPromise) {
        return catalogPromise;
    }

    catalogPromise = (async () => {
        try {
            const response = await fetch(
                `${COINGECKO_BASE}/coins/list?include_platform=false`,
                {
                    headers:
                        coinGeckoHeaders(),
                },
            );

            if (!response.ok) {
                throw new Error(
                    'CoinGecko catalogue request failed',
                );
            }

            const data =
                (await response.json()) as Array<{
                    id: string;
                    symbol: string;
                    name: string;
                }>;

            const seen = new Set<string>();

            const catalog = data
                .filter(
                    coin =>
                        Boolean(coin?.id) &&
                        Boolean(coin?.name) &&
                        Boolean(coin?.symbol),
                )
                .map(coin => ({
                    id: coin.id,
                    symbol:
                        coin.symbol.toUpperCase(),
                    name: coin.name,
                }))
                .filter(coin => {
                    if (seen.has(coin.id)) {
                        return false;
                    }

                    seen.add(coin.id);
                    return true;
                })
                .sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name,
                        ),
                );

            catalogCache = catalog;
            return catalog;
        } catch {
            return [];
        } finally {
            catalogPromise = null;
        }
    })();

    return catalogPromise;
}
