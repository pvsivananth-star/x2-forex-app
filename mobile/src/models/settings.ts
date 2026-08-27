export type TabCategory = 'dashboard' | 'fx' | 'crypto' | 'metals' | 'equity' | 'charts' | 'portfolio' | 'settings';
export type Tenor = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
export type DecimalPlaces = 2 | 3 | 4;
export type ThemePreference = 'system' | 'light' | 'dark';

export interface Settings {
  activeTab: TabCategory;
  tenor: Tenor;
  decimalPlaces: DecimalPlaces;
  theme: ThemePreference;
}
