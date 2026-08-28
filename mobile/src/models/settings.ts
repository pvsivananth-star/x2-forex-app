import type {
    DecimalPlaces,
    TabCategory,
    Tenor,
    ThemePreference,
} from './index';

export interface Settings {
    activeTab: TabCategory;
    tenor: Tenor;
    decimalPlaces: DecimalPlaces;
    theme: ThemePreference;
}
