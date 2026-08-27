import { PortfolioPosition } from '../../models/portfolio';
import { getSecure, setSecure } from '../persistence';

const KEY = 'portfolio';

export async function loadPortfolio(): Promise<PortfolioPosition[]> {
  return (await getSecure<PortfolioPosition[]>(KEY)) ?? [];
}

export async function savePortfolio(
  positions: PortfolioPosition[],
): Promise<void> {
  await setSecure(KEY, positions);
}
