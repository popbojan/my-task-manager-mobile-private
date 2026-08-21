export const recurringTheme = {
  pageBg: '#060908',
  pageBgElevated: '#0a0e0c',
  surfaceCard: '#101512',
  surfaceElevated: '#161d19',
  surfaceInset: '#0b100e',
  cardBorder: 'rgba(255, 255, 255, 0.09)',
  cardBorderAccent: 'rgba(82, 183, 136, 0.35)',
  textPrimary: '#f8faf9',
  textSecondary: 'rgba(248, 250, 249, 0.68)',
  textMuted: 'rgba(248, 250, 249, 0.42)',
  accent: '#52b788',
  accentBright: '#6ecfaa',
  accentDark: '#1b4332',
  accentGlow: 'rgba(82, 183, 136, 0.32)',
  fireRed: '#ef4444',
  fireRedBright: '#f87171',
  fireRedSoft: 'rgba(239, 68, 68, 0.14)',
  gold: '#d4a843',
  goldBright: '#f0cc62',
  goldSoft: 'rgba(212, 168, 67, 0.14)',
  shineLine: 'rgba(255, 255, 255, 0.14)',
  vignette: 'rgba(0, 0, 0, 0.55)',
} as const;

export const premiumType = {
  overline: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: 17,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
};
