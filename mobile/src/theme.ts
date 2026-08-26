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

export const DARK_COLORS:
    AppColors = {
    background:
        '#0A0F18',

    surface:
        '#111827',

    surfaceElevated:
        '#172033',

    border:
        '#273449',

    text:
        '#F4F7FB',

    muted:
        '#A8B3C2',

    dim:
        '#718096',

    accent:
        '#4DA3FF',

    accentStrong:
        '#216EAF',

    positive:
        '#19B88A',

    negative:
        '#EF5969',

    warning:
        '#D9A441',

    overlay:
        'rgba(0,0,0,0.72)',
};

export const LIGHT_COLORS:
    AppColors = {
    background:
        '#F3F6FA',

    surface:
        '#FFFFFF',

    surfaceElevated:
        '#F8FAFC',

    border:
        '#D9E1EB',

    text:
        '#172033',

    muted:
        '#526174',

    dim:
        '#7A8798',

    accent:
        '#1769AA',

    accentStrong:
        '#155A91',

    positive:
        '#078A67',

    negative:
        '#D9364F',

    warning:
        '#A86F00',

    overlay:
        'rgba(15,23,42,0.58)',
};