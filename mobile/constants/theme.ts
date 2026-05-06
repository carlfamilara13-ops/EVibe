// GoGreen Theme System — each vibe used per page

const vibes = {
  nature: {
    primary: '#2D9B4E', primaryLight: '#4CAF70', primaryDark: '#1B6B33',
    accent: '#8BC34A', accentSoft: '#DCEDC8', gradient: ['#2D9B4E', '#1B6B33'],
    bg: '#F7FBF7', bgCard: '#FFFFFF', bgSurface: '#EEF7EE', bgElevated: '#E3F2E3',
    border: '#C8E6C9', text: '#1A2E1A', textMuted: '#4A7A4A', textDim: '#8AAF8A',
    danger: '#E53935', warning: '#F9A825', info: '#0288D1',
    white: '#FFFFFF', dark: '#1A2E1A', tabBg: '#FFFFFF', statusBar: 'dark' as const,
  },
  ocean: {
    primary: '#0077B6', primaryLight: '#00B4D8', primaryDark: '#023E8A',
    accent: '#48CAE4', accentSoft: '#ADE8F4', gradient: ['#0077B6', '#023E8A'],
    bg: '#F0F8FF', bgCard: '#FFFFFF', bgSurface: '#E1F0FA', bgElevated: '#CAE4F5',
    border: '#B0D4ED', text: '#03045E', textMuted: '#0077B6', textDim: '#90C4E4',
    danger: '#EF233C', warning: '#F4A261', info: '#48CAE4',
    white: '#FFFFFF', dark: '#03045E', tabBg: '#FFFFFF', statusBar: 'dark' as const,
  },
  energy: {
    primary: '#00C853', primaryLight: '#69F0AE', primaryDark: '#00701A',
    accent: '#FFD600', accentSoft: '#FFF9C4', gradient: ['#00C853', '#007B33'],
    bg: '#0A0A0A', bgCard: '#141414', bgSurface: '#1E1E1E', bgElevated: '#252525',
    border: '#2A2A2A', text: '#F5F5F5', textMuted: '#00C853', textDim: '#555555',
    danger: '#FF1744', warning: '#FFD600', info: '#00E5FF',
    white: '#FFFFFF', dark: '#0A0A0A', tabBg: '#141414', statusBar: 'light' as const,
  },
  warm: {
    primary: '#43A047', primaryLight: '#76C442', primaryDark: '#2E7D32',
    accent: '#FF8F00', accentSoft: '#FFE0B2', gradient: ['#43A047', '#2E7D32'],
    bg: '#FFFDF7', bgCard: '#FFFFFF', bgSurface: '#F1F8E9', bgElevated: '#E8F5E9',
    border: '#DCEDC8', text: '#212121', textMuted: '#558B2F', textDim: '#AED581',
    danger: '#E64A19', warning: '#FF8F00', info: '#0097A7',
    white: '#FFFFFF', dark: '#212121', tabBg: '#FFFFFF', statusBar: 'dark' as const,
  },
};

export type Vibe = typeof vibes.nature;

export const NATURE = vibes.nature;   // Map page
export const OCEAN  = vibes.ocean;    // Stations page
export const ENERGY = vibes.energy;   // Budget page
export const WARM   = vibes.warm;     // Carbon page
export const GG     = vibes.nature;   // Default (login, tabs bar)

export const EV = {
  primary: GG.primary, primaryDark: GG.primaryDark, primaryDeep: GG.primaryDark,
  accent: GG.accent, accentSoft: GG.accentSoft, neon: GG.primaryLight,
  bg: GG.bg, bgCard: GG.bgCard, bgSurface: GG.bgSurface, bgElevated: GG.bgElevated,
  border: GG.border, borderGlow: GG.primary + '40',
  text: GG.text, textMuted: GG.textMuted, textDim: GG.textDim,
  danger: GG.danger, warning: GG.warning, info: GG.info, white: GG.white,
};

export const Colors = {
  light: { text: GG.text, background: GG.bg, tint: GG.primary, icon: GG.textMuted, tabIconDefault: GG.textDim, tabIconSelected: GG.primary },
  dark:  { text: GG.text, background: GG.bg, tint: GG.primary, icon: GG.textMuted, tabIconDefault: GG.textDim, tabIconSelected: GG.primary },
};
