import { Settings } from '../models/settings';
let state: Settings = { activeTab: 'fx', tenor: '1D', decimalPlaces: 4, theme: 'system' };
const listeners = new Set<() => void>();
export const settingsStore = { get: () => state, set: (next: Partial<Settings>) => { state = { ...state, ...next }; listeners.forEach(x => x()); }, subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); } };
