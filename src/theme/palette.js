import { alpha } from '@mui/material/styles';

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
export const brand = {
  navy: '#1B1F3A',
  navyDark: '#12151F',
  navyMid: '#252945',
  gold: '#C8972A',
  goldLight: '#E8B84B',
  teal: '#2DD4BF',
  blue: '#3B82F6',
  surface: '#F8F7F4',
};

export const grey = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#E5E7EB',
  400: '#D1D5DB',
  500: '#9CA3AF',
  600: '#6B7280',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
};

// Primary = deep navy
export const primary = {
  lighter: '#E8EBF8',
  light: '#8892CC',
  main: '#1B1F3A',
  dark: '#12151F',
  darker: '#0A0C14',
  contrastText: '#FFFFFF',
};

// Secondary = warm gold
export const secondary = {
  lighter: '#FDF3DC',
  light: '#E8B84B',
  main: '#C8972A',
  dark: '#9B721A',
  darker: '#6B4F12',
  contrastText: '#FFFFFF',
};

export const info = {
  lighter: '#EEF2FF',
  light: '#818CF8',
  main: '#3B82F6',
  dark: '#1D4ED8',
  darker: '#1E3A8A',
  contrastText: '#FFFFFF',
};

export const success = {
  lighter: '#DCFCE7',
  light: '#4ADE80',
  main: '#22C55E',
  dark: '#15803D',
  darker: '#14532D',
  contrastText: '#FFFFFF',
};

export const warning = {
  lighter: '#FEF9C3',
  light: '#FDE047',
  main: '#F59E0B',
  dark: '#B45309',
  darker: '#78350F',
  contrastText: grey[800],
};

export const error = {
  lighter: '#FEE2E2',
  light: '#FCA5A5',
  main: '#EF4444',
  dark: '#B91C1C',
  darker: '#7F1D1D',
  contrastText: '#FFFFFF',
};

export const common = {
  black: '#000000',
  white: '#FFFFFF',
};

export const action = {
  hover: alpha(primary.main, 0.06),
  selected: alpha(primary.main, 0.12),
  disabled: alpha(grey[500], 0.8),
  disabledBackground: alpha(grey[500], 0.20),
  focus: alpha(grey[500], 0.20),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

const base = { primary, secondary, info, success, warning, error, grey, common, divider: alpha(grey[400], 0.24), action };

export function palette() {
  return {
    ...base,
    mode: 'light',
    text: {
      primary: brand.navy,
      secondary: '#5A607F',
      disabled: grey[500],
    },
    background: {
      paper: '#FFFFFF',
      default: brand.surface,
      neutral: '#F1F0EC',
      dark: brand.navyDark,
      sidebar: brand.navyDark,
    },
    gradients: {
      primary: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.navyMid} 100%)`,
      gold: `linear-gradient(135deg, ${brand.gold} 0%, ${brand.goldLight} 100%)`,
      teal: `linear-gradient(135deg, ${brand.teal} 0%, ${brand.blue} 100%)`,
      male: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      female: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
      glass: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 100%)',
    },
    brand,
    action: { ...base.action, active: '#5A607F' },
  };
}
