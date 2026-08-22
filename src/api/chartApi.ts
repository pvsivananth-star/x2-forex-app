export interface ChartPoint {
    date: string;
    rate: number;
}

/**
 * Fetches 7-day historical rate trend for EUR/USD from Frankfurter
 */
export const fetchHistoricalData = async (): Promise<ChartPoint[]> => {
    try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - 7);
        const startDate = startDateObj.toISOString().split('T')[0];

        const response = await fetch(
            `https://api.frankfurter.dev/v1/${startDate}..${endDate}?from=USD&to=EUR`
        );
        const data = await response.json();

        if (data.rates) {
            return Object.keys(data.rates).map((date) => ({
                date,
                rate: data.rates[date].EUR,
            }));
        }
        return [];
    } catch (error) {
        console.warn('Failed to fetch historical chart data', error);
        return [];
    }
};
