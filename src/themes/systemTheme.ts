export const SYSTEM_THEME = {
  layout: {
    appShell: 'app-system-bg min-h-screen',
    appContent: 'app-content-shell px-4 py-6 sm:px-6 sm:py-8 md:px-8',
  },
  typography: {
    familySans: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  },
  tokens: {
    bgBase: 'var(--sys-bg-base)',
    textBase: 'var(--sys-text-base)',
    borderSoft: 'var(--sys-border-soft)',
    shadowSoft: 'var(--sys-shadow-soft)',
  },
} as const

export type SystemTheme = typeof SYSTEM_THEME
