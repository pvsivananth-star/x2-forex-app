import React, { createContext, useContext, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
    background: string;
    card: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentMuted: string;
    green: string;
    red: string;
    inputBg: string;
}

const lightColors: ThemeColors = {
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    accent: '#2563EB',
    accentMuted: '#DBEAFE',
    green: '#16A34A',
    red: '#DC2626',
    inputBg: '#F1F5F9',
};

const darkColors: ThemeColors = {
    background: '#0B0F17',
    card: '#161B26',
    cardBorder: '#262D3D',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#3B82F6',
    accentMuted: '#1E293B',
    green: '#22C55E',
    red: '#EF4444',
    inputBg: '#1E293B',
};

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    colors: ThemeColors;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'system',
    setMode: () => {},
    colors: darkColors,
    isDark: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const deviceScheme = useDeviceColorScheme();
    const [mode, setMode] = useState<ThemeMode>('system');

    const resolvedScheme = mode === 'system' ? (deviceScheme || 'dark') : mode;
    const isDark = resolvedScheme === 'dark';
    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ mode, setMode, colors, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);