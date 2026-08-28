export interface PortfolioPosition {
    id: string;
    symbol: string;
    quantity: number;
    averageCost: number;
    currency: string;
}

export interface PortfolioState {
    positions: PortfolioPosition[];
}
