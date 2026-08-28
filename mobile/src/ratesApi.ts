import {CryptoCatalogItem, FetchedMap, Tenor,} from './types';

const TENOR_DAYS: Record<
    Tenor,
    number
> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
};

const TENOR_TRADING_DAYS: Record<
    Tenor,
    number
> = {
    '1D': 1,
    '1W': 5,
    '1M': 21,
    '3M': 63,
    '6M': 126,
    '1Y': 252,
};

function isoDaysAgo(
    days: number,
): string {
    const date =
        new Date();

    date.setDate(
        date.getDate() -
        days,
    );

    return date
        .toISOString()
        .slice(0, 10);
}

function percentageChange(
    current: number,
    reference: number,
): number {
    if (
        !Number.isFinite(
            current,
        ) ||
        !Number.isFinite(
            reference,
        ) ||
        reference === 0
    ) {
        return 0;
    }

    return Number(
        (
            (
                (
                    current -
                    reference
                ) /
                reference
            ) *
            100
        ).toFixed(2),
    );
}

/* -------------------------------------------------------------------------- */
/* FX                                                                        */
/* -------------------------------------------------------------------------- */

const FX_MAP: Record<
    string,
    {
        ccy: string;
        invert: boolean;
    }
> = {
    EUR: {
        ccy: 'EUR',
        invert: true,
    },
    JPY: {
        ccy: 'JPY',
        invert: false,
    },
    GBP: {
        ccy: 'GBP',
        invert: true,
    },
    CAD: {
        ccy: 'CAD',
        invert: false,
    },
    AUD: {
        ccy: 'AUD',
        invert: true,
    },
    CHF: {
        ccy: 'CHF',
        invert: false,
    },
    CNY: {
        ccy: 'CNY',
        invert: false,
    },
    SEK: {
        ccy: 'SEK',
        invert: false,
    },
    NOK: {
        ccy: 'NOK',
        invert: false,
    },
    NZD: {
        ccy: 'NZD',
        invert: true,
    },
    SGD: {
        ccy: 'SGD',
        invert: false,
    },
    HKD: {
        ccy: 'HKD',
        invert: false,
    },
    INR: {
        ccy: 'INR',
        invert: false,
    },
    ZAR: {
        ccy: 'ZAR',
        invert: false,
    },
    BRL: {
        ccy: 'BRL',
        invert: false,
    },
    MXN: {
        ccy: 'MXN',
        invert: false,
    },
    PLN: {
        ccy: 'PLN',
        invert: false,
    },
    DKK: {
        ccy: 'DKK',
        invert: false,
    },
    THB: {
        ccy: 'THB',
        invert: false,
    },
};

export async function fetchFxData(
    tenor: Tenor,
): Promise<FetchedMap> {
    const currencies =
        Object.values(
            FX_MAP,
        )
            .map(
                (item) =>
                    item.ccy,
            )
            .join(',');

    const result:
        FetchedMap = {
        USD: {
            rate: 1,
            referenceRate: 1,
            changePct: 0,
        },
    };

    try {
        const [
            currentResponse,
            historicalResponse,
        ] = await Promise.all([
            fetch(
                `https://api.frankfurter.app/latest?from=USD&to=${currencies}`,
            ),

            fetch(
                `https://api.frankfurter.app/${isoDaysAgo(
                    TENOR_DAYS[
                        tenor
                        ],
                )}?from=USD&to=${currencies}`,
            ),
        ]);

        if (
            !currentResponse.ok
        ) {
            throw new Error(
                'Current FX request failed',
            );
        }

        const current =
            await currentResponse.json();

        const historical =
            historicalResponse.ok
                ? await historicalResponse.json()
                : {};

        Object.entries(
            FX_MAP,
        ).forEach(
            ([
                 symbol,
                 mapping,
             ]) => {
                const currentRaw =
                    current
                        ?.rates?.[
                        mapping.ccy
                        ];

                const historicalRaw =
                    historical
                        ?.rates?.[
                        mapping.ccy
                        ];

                if (
                    typeof currentRaw !==
                    'number'
                ) {
                    return;
                }

                const rate =
                    mapping.invert
                        ? 1 /
                        currentRaw
                        : currentRaw;

                const reference =
                    typeof historicalRaw ===
                    'number'
                        ? mapping.invert
                            ? 1 /
                            historicalRaw
                            : historicalRaw
                        : rate;

                result[symbol] = {
                    rate: Number(
                        rate.toFixed(
                            8,
                        ),
                    ),

                    referenceRate:
                        Number(
                            reference.toFixed(
                                8,
                            ),
                        ),

                    changePct:
                        percentageChange(
                            rate,
                            reference,
                        ),
                };
            },
        );
    } catch {
        // Keep previous/cached values.
    }

    return result;
}

/* -------------------------------------------------------------------------- */
/* COINGECKO                                                                  */
/* -------------------------------------------------------------------------- */

const COINGECKO_BASE =
    'https://api.coingecko.com/api/v3';

const COINGECKO_API_KEY =
    process.env
        .EXPO_PUBLIC_COINGECKO_API_KEY ??
    '';

function coinGeckoHeaders():
    Record<string, string> {
    if (
        !COINGECKO_API_KEY
    ) {
        return {};
    }

    return {
        'x-cg-demo-api-key':
        COINGECKO_API_KEY,
    };
}

let cryptoCatalogCache:
    CryptoCatalogItem[] | null =
    null;

let cryptoCatalogPromise:
    Promise<
        CryptoCatalogItem[]
    > | null = null;

export async function fetchCryptoCatalog(): Promise<
    CryptoCatalogItem[]
> {
    if (
        cryptoCatalogCache
    ) {
        return cryptoCatalogCache;
    }

    if (
        cryptoCatalogPromise
    ) {
        return cryptoCatalogPromise;
    }

    cryptoCatalogPromise =
        (async () => {
            try {
                const response =
                    await fetch(
                        `${COINGECKO_BASE}/coins/list?include_platform=false`,
                        {
                            headers:
                                coinGeckoHeaders(),
                        },
                    );

                if (
                    !response.ok
                ) {
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

                const seen =
                    new Set<string>();

                const catalog =
                    data
                        .filter(
                            (
                                coin,
                            ) =>
                                Boolean(
                                    coin?.id,
                                ) &&
                                Boolean(
                                    coin?.name,
                                ) &&
                                Boolean(
                                    coin?.symbol,
                                ),
                        )
                        .map(
                            (
                                coin,
                            ) => ({
                                id: coin.id,
                                symbol:
                                    coin.symbol.toUpperCase(),
                                name: coin.name,
                            }),
                        )
                        .filter(
                            (
                                coin,
                            ) => {
                                if (
                                    seen.has(
                                        coin.id,
                                    )
                                ) {
                                    return false;
                                }

                                seen.add(
                                    coin.id,
                                );

                                return true;
                            },
                        )
                        .sort(
                            (
                                a,
                                b,
                            ) =>
                                a.name.localeCompare(
                                    b.name,
                                ),
                        );

                cryptoCatalogCache =
                    catalog;

                return catalog;
            } catch {
                return [];
            } finally {
                cryptoCatalogPromise =
                    null;
            }
        })();

    return cryptoCatalogPromise;
}

interface CoinMarket {
    id: string;
    current_price:
        | number
        | null;

    price_change_percentage_24h:
        | number
        | null;

    price_change_percentage_7d_in_currency?:
        | number
        | null;

    price_change_percentage_30d_in_currency?:
        | number
        | null;

    price_change_percentage_1y_in_currency?:
        | number
        | null;
}

const MARKET_BATCH_SIZE =
    100;

async function fetchCoinMarkets(
    ids: string[],
): Promise<CoinMarket[]> {
    if (!ids.length) {
        return [];
    }

    const batches: string[][] =
        [];

    for (
        let i = 0;
        i < ids.length;
        i += MARKET_BATCH_SIZE
    ) {
        batches.push(
            ids.slice(
                i,
                i +
                MARKET_BATCH_SIZE,
            ),
        );
    }

    const results =
        await Promise.all(
            batches.map(
                async (
                    batch,
                ) => {
                    const response =
                        await fetch(
                            `${COINGECKO_BASE}/coins/markets` +
                            `?vs_currency=usd` +
                            `&ids=${batch
                                .map(
                                    encodeURIComponent,
                                )
                                .join(
                                    ',',
                                )}` +
                            `&order=market_cap_desc` +
                            `&per_page=250` +
                            `&page=1` +
                            `&sparkline=false` +
                            `&price_change_percentage=24h,7d,30d,1y`,
                            {
                                headers:
                                    coinGeckoHeaders(),
                            },
                        );

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            'CoinGecko market request failed',
                        );
                    }

                    return (
                        (await response.json()) as CoinMarket[]
                    );
                },
            ),
        );

    return results.flat();
}

async function fetchCryptoHistory(
    id: string,
    days: number,
): Promise<number | null> {
    try {
        const response =
            await fetch(
                `${COINGECKO_BASE}/coins/${encodeURIComponent(
                    id,
                )}/market_chart?vs_currency=usd&days=${days}`,
                {
                    headers:
                        coinGeckoHeaders(),
                },
            );

        if (
            !response.ok
        ) {
            return null;
        }

        const json =
            await response.json();

        const prices =
            Array.isArray(
                json?.prices,
            )
                ? json.prices
                : [];

        if (
            !prices.length
        ) {
            return null;
        }

        const first =
            prices[0]?.[1];

        return typeof first ===
        'number'
            ? first
            : null;
    } catch {
        return null;
    }
}

function referenceFromPercentage(
    current: number,
    changePct:
        | number
        | null
        | undefined,
): number | null {
    if (
        typeof changePct !==
        'number' ||
        !Number.isFinite(
            changePct,
        ) ||
        changePct <= -100
    ) {
        return null;
    }

    return (
        current /
        (
            1 +
            changePct / 100
        )
    );
}

export async function fetchCryptoData(
    tenor: Tenor,
    selectedIds: string[],
): Promise<FetchedMap> {
    const result:
        FetchedMap = {};

    if (
        !selectedIds.length
    ) {
        return result;
    }

    try {
        const markets =
            await fetchCoinMarkets(
                selectedIds,
            );

        const marketMap =
            new Map<
                string,
                CoinMarket
            >();

        markets.forEach(
            (market) => {
                marketMap.set(
                    market.id,
                    market,
                );
            },
        );

        await Promise.all(
            selectedIds.map(
                async (id) => {
                    const market =
                        marketMap.get(
                            id,
                        );

                    if (
                        !market
                    ) {
                        return;
                    }

                    const current =
                        market.current_price;

                    if (
                        typeof current !==
                        'number' ||
                        !Number.isFinite(
                            current,
                        )
                    ) {
                        return;
                    }

                    let reference:
                        number | null =
                        null;

                    /*
                     * CoinGecko supplies the
                     * percentage directly for
                     * these important tenors.
                     */
                    if (
                        tenor === '1D'
                    ) {
                        reference =
                            referenceFromPercentage(
                                current,
                                market.price_change_percentage_24h,
                            );
                    } else if (
                        tenor === '1W'
                    ) {
                        reference =
                            referenceFromPercentage(
                                current,
                                market.price_change_percentage_7d_in_currency,
                            );
                    } else if (
                        tenor === '1M'
                    ) {
                        reference =
                            referenceFromPercentage(
                                current,
                                market.price_change_percentage_30d_in_currency,
                            );
                    } else if (
                        tenor === '1Y'
                    ) {
                        reference =
                            referenceFromPercentage(
                                current,
                                market.price_change_percentage_1y_in_currency,
                            );
                    } else {
                        reference =
                            await fetchCryptoHistory(
                                id,
                                TENOR_DAYS[
                                    tenor
                                    ],
                            );
                    }

                    if (
                        !reference ||
                        !Number.isFinite(
                            reference,
                        )
                    ) {
                        reference =
                            current;
                    }

                    result[id] = {
                        rate: Number(
                            current.toFixed(
                                12,
                            ),
                        ),

                        referenceRate:
                            Number(
                                reference.toFixed(
                                    12,
                                ),
                            ),

                        changePct:
                            percentageChange(
                                current,
                                reference,
                            ),
                    };
                },
            ),
        );
    } catch {
        // Keep previous values.
    }

    return result;
}

/* -------------------------------------------------------------------------- */
/* METALS                                                                     */
/* -------------------------------------------------------------------------- */

const METAL_TICKERS: Record<
    string,
    string
> = {
    XAU: 'GC=F',   // Gold - USD / troy oz
    XAG: 'SI=F',   // Silver - USD / troy oz
    XPT: 'PL=F',   // Platinum - USD / troy oz
    XPD: 'PA=F',   // Palladium - USD / troy oz

    XCU: 'HG=F',   // Copper - USD / lb

    XAL: 'AL=F',   // Aluminium - USD / metric tonne
    XNI: 'NI=F',   // Nickel - USD / metric tonne
    XZN: 'ZNC=F',  // Zinc - USD / metric tonne
    XPB: 'LED=F',  // Lead - USD / metric tonne
};

/*
 * Yahoo prices for the following metals are quoted
 * per metric tonne.
 *
 * The application displays them per pound.
 */
const POUNDS_PER_METRIC_TONNE =
    2204.62262185;

/*
 * The application does not currently have a reliable
 * live Yahoo ticker for Rhodium.
 *
 * Do NOT invent a market price for it.
 */
const METAL_UNITS: Record<
    string,
    {
        base: string;
        factor: number;
    }
> = {
    XAU_1OZ: {
        base: 'XAU',
        factor: 1,
    },

    XAG_1OZ: {
        base: 'XAG',
        factor: 1,
    },

    XPT_1OZ: {
        base: 'XPT',
        factor: 1,
    },

    XPD_1OZ: {
        base: 'XPD',
        factor: 1,
    },

    XCU_1LB: {
        base: 'XCU',
        factor: 1,
    },

    XAL_1LB: {
        base: 'XAL',
        factor:
            1 /
            POUNDS_PER_METRIC_TONNE,
    },

    XNI_1LB: {
        base: 'XNI',
        factor:
            1 /
            POUNDS_PER_METRIC_TONNE,
    },

    XZN_1LB: {
        base: 'XZN',
        factor:
            1 /
            POUNDS_PER_METRIC_TONNE,
    },

    XPB_1LB: {
        base: 'XPB',
        factor:
            1 /
            POUNDS_PER_METRIC_TONNE,
    },
};

async function fetchYahooSeries(
    ticker: string,
): Promise<{
    current: number;
    closes: number[];
} | null> {
    try {
        const response =
            await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
                    ticker,
                )}?interval=1d&range=1y`,
            );

        if (!response.ok) {
            return null;
        }

        const json =
            await response.json();

        const chart =
            json?.chart?.result?.[0];

        const closes =
            chart
                ?.indicators
                ?.quote?.[0]
                ?.close
                ?.filter(
                    (
                        value:
                            number | null,
                    ) =>
                        typeof value ===
                        'number' &&
                        Number.isFinite(
                            value,
                        ),
                ) || [];

        const current =
            chart?.meta
                ?.regularMarketPrice ??
            closes[
            closes.length - 1
                ];

        if (
            typeof current !==
            'number' ||
            !Number.isFinite(
                current,
            ) ||
            !closes.length
        ) {
            return null;
        }

        return {
            current,
            closes,
        };
    } catch {
        return null;
    }
}

export async function fetchMetalsData(
    tenor: Tenor,
): Promise<FetchedMap> {
    const result:
        FetchedMap = {};

    /*
     * First obtain the actual Yahoo market
     * price for each base metal.
     */
    const baseResults:
        Record<
            string,
            {
                rate: number;
                referenceRate: number;
            }
        > = {};

    await Promise.all(
        Object.entries(
            METAL_TICKERS,
        ).map(
            async (
                [
                    base,
                    ticker,
                ],
            ) => {
                const series =
                    await fetchYahooSeries(
                        ticker,
                    );

                if (!series) {
                    return;
                }

                const offset =
                    TENOR_TRADING_DAYS[
                        tenor
                        ];

                const index =
                    Math.max(
                        0,
                        series.closes.length -
                        1 -
                        offset,
                    );

                const reference =
                    series.closes[
                        index
                        ] ??
                    series.current;

                if (
                    !Number.isFinite(
                        reference,
                    ) ||
                    reference <= 0
                ) {
                    return;
                }

                baseResults[
                    base
                    ] = {
                    rate:
                    series.current,

                    referenceRate:
                    reference,
                };
            },
        ),
    );

    /*
     * Convert every Yahoo base quote into
     * the application's displayed unit.
     */
    Object.entries(
        METAL_UNITS,
    ).forEach(
        ([
             symbol,
             mapping,
         ]) => {
            const base =
                baseResults[
                    mapping.base
                    ];

            if (!base) {
                /*
                 * No live market value.
                 *
                 * Do NOT manufacture a value.
                 */
                return;
            }

            const rate =
                base.rate *
                mapping.factor;

            const reference =
                base.referenceRate *
                mapping.factor;

            if (
                !Number.isFinite(
                    rate,
                ) ||
                !Number.isFinite(
                    reference,
                ) ||
                rate <= 0 ||
                reference <= 0
            ) {
                return;
            }

            result[symbol] = {
                rate: Number(
                    rate.toFixed(
                        8,
                    ),
                ),

                referenceRate:
                    Number(
                        reference.toFixed(
                            8,
                        ),
                    ),

                changePct:
                    percentageChange(
                        rate,
                        reference,
                    ),
            };
        },
    );

    return result;
}