import { Box, Stack, Typography } from '@mui/material'
import { tokens, rem } from '../theme'

export default function Panel({ title, accentRight, dialog, children, sx }) {
  return (
    <Box
      sx={{
        ...(dialog
          ? {}
          : {
              background: tokens.panel,
              border: `1px solid ${tokens.border}`,
              boxShadow: tokens.insetGlow,
              borderRadius: '4px',
            }),
        p: 1.75,
        ...sx,
      }}
    >
      {title && (
        <>
          {dialog ? (
            <Box sx={{ mb: 1.5, pr: rem(30) }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: rem(10),
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: tokens.red,
                  textShadow: `0 0 0.75rem ${tokens.red}`,
                  lineHeight: 1.4,
                }}
              >
                LSCRIPTS
              </Typography>
              <Stack direction="row" spacing={1.25} alignItems="baseline">
                <Typography
                  sx={{
                    color: '#fff',
                    lineHeight: 1.15,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: rem(18),
                    letterSpacing: '0.12em',
                    flex: 1,
                  }}
                >
                  {title}
                </Typography>
                {accentRight && (
                  <Typography
                    sx={{ fontFamily: tokens.mono, fontSize: rem(12), color: tokens.red, textShadow: `0 0 0.625rem ${tokens.red}` }}
                  >
                    {accentRight}
                  </Typography>
                )}
              </Stack>
            </Box>
          ) : (
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5, pr: accentRight ? rem(30) : 0 }}>
              <Box sx={{ width: '3px', height: rem(16), background: tokens.red, boxShadow: `0 0 0.625rem ${tokens.red}` }} />
              <Typography
                sx={{
                  color: '#fff',
                  lineHeight: 1.1,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: rem(18),
                  letterSpacing: '0.12em',
                  flex: 1,
                }}
              >
                {title}
              </Typography>
              {accentRight && (
                <Typography
                  sx={{ fontFamily: tokens.mono, fontSize: rem(12), color: tokens.red, textShadow: `0 0 0.625rem ${tokens.red}` }}
                >
                  {accentRight}
                </Typography>
              )}
            </Stack>
          )}
          <Box sx={{ height: '1px', background: tokens.border, mb: 1.75 }} />
        </>
      )}
      {children}
    </Box>
  )
}
