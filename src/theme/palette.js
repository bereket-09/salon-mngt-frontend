import { alpha } from '@mui/material/styles';

// ─── Brand Tokens (Editorial Luxury: bone / ink / muted bronze) ───────────────
// Key names kept (navy/gold) for backward-compat; values are the new palette.
export const brand = {
  navy: '#1A1A1A',      // ink
  navyDark: '#141312',  // near-black warm
  navyMid: '#2A2722',   // warm charcoal
  gold: '#9A7B4F',      // muted bronze (single accent)
  goldLight: '#B8946A', // light bronze
  teal: '#2DD4BF',
  blue: '#3B82F6',
  surface: '#FAF8F3',   // bone
};

// Warm neutral grey scale (editorial)
export const grey = {
  0: '#FFFFFF',
  100: '#F8F6F1',
  200: '#F1EEE7',
  300: '#E5E0D6',
  400: '#D4CEC1',
  500: '#A39C8E',
  600: '#6E685C',
  700: '#3C382F',
  800: '#221F1A',
  900: '#14120E',
};

// Primary = ink
export const primary = {
  lighter: '#EBE9E4',
  light: '#4A4742',
  main: '#1A1A1A',
  dark: '#111111',
  darker: '#000000',
  contrastText: '#FFFFFF',
};

// Secondary = muted bronze
export const secondary = {
  lighter: '#F1E9DD',
  light: '#B8946A',
  main: '#9A7B4F',
  dark: '#7A6038',
  darker: '#564326',
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
      secondary: '#6E685C',
      disabled: grey[500],
    },
    background: {
      paper: '#FFFFFF',
      default: brand.surface,
      neutral: '#F1EEE7',
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
    action: { ...base.action, active: '#6E685C' },
  };
}
