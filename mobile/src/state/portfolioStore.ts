import {PortfolioPosition} from '../models/portfolio';

let positions: PortfolioPosition[] = [];
const listeners = new Set<() => void>();
export const portfolioStore = {
    get: () => positions, set: (next: PortfolioPosition[]) => {
        positions = next;
        listeners.forEach(x => x());
    }, subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
};
