import { createTheme } from '@mui/material/styles'

export const rem = (px) => `${px / 16}rem`

export const tokens = {
  red: 'var(--accent, #2CB0FD)',
  redSoft: 'var(--accent-soft, #6cc5fd)',
  accentShadow: 'rgba(var(--accent-rgb, 44,176,253),0.75)',
  panel: 'rgba(7,7,7,0.93)',
  border: 'rgba(255,255,255,0.14)',
  insetGlow: '0 0 1.125rem rgba(255,255,255,0.15) inset',
  money: 'rgb(175,255,72)',
  moneyShadow: 'rgba(175,255,72,0.75)',
  danger: 'rgb(255,70,70)',
  dangerSoft: 'rgb(255,120,120)',
  mono: "'Share Tech Mono', monospace",
}

const theme = createTheme({
  spacing: (factor) => `${factor * 0.5}rem`,
  palette: {
    mode: 'dark',
    primary: { main: '#2CB0FD' },
    secondary: { main: '#6cc5fd' },
    background: { default: 'transparent', paper: tokens.panel },
    text: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.5)' },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: "'Rajdhani', system-ui, sans-serif",
    h3: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' },
    h6: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' },
    overline: { letterSpacing: '0.3em', fontWeight: 700 },
    body2: { fontWeight: 500 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.insetGlow,
        },
      },
    },
  },
})

export default theme
