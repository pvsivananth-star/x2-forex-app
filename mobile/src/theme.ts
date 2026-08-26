export interface AppColors {
    background: string;
    surface: string;
    surfaceElevated: string;
    border: string;

    text: string;
    muted: string;
    dim: string;

    accent: string;
    accentStrong: string;

    positive: string;
    negative: string;
    warning: string;

    overlay: string;
}

export const DARK_COLORS: AppColors = {
    background: '#0B1220',
    surface: '#111A2B',
    surfaceElevated: '#172238',
    border: '#26354D',

    text: '#F5F7FA',
    muted: '#A8B3C5',
    dim: '#738198',

    accent: '#4EA7FF',
    accentStrong: '#2477C5',

    positive: '#20C997',
    negative: '#FF5C6C',
    warning: '#F2B84B',

    overlay: 'rgba(0,0,0,0.70)',
};

export const LIGHT_COLORS: AppColors = {
    background: '#F4F7FB',
    surface: '#FFFFFF',
    surfaceElevated: '#F8FAFD',
    border: '#DCE4EF',

    text: '#172033',
    muted: '#536176',
    dim: '#7A879A',

    accent: '#1769AA',
    accentStrong: '#155A91',

    positive: '#078A67',
    negative: '#D9364F',
    warning: '#B77900',

    overlay: 'rgba(15,23,42,0.55)',
};