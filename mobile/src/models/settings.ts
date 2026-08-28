import type {
    DecimalPlaces,
    TabCategory,
    Tenor,
    ThemePreference,
} from './index';

export interface Settings {
    activeTab: TabCategory;
    tenorFx: Tenor;
    tenorCrypto: Tenor;
    tenorMetals: Tenor;
    decimalPlaces: DecimalPlaces;
    theme: ThemePreference;
}
