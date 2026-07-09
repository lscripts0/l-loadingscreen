import { Box, Stack, Typography } from '@mui/material'
import { tokens, rem } from '../theme'

export default function ProgressBar({ value, stage }) {
  const pct = Math.max(0, Math.min(100, value || 0))
  return (
    <Box sx={{ maxWidth: rem(760) }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{
            color: 'rgba(255,255,255,0.55)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: rem(13),
          }}
        >
          {stage}
        </Typography>
        <Typography
          sx={{
            ml: 2,
            fontFamily: tokens.mono,
            fontSize: rem(20),
            fontWeight: 700,
            color: tokens.red,
            textShadow: `0 0 14px ${tokens.red}`,
          }}
        >
          {pct}%
        </Typography>
      </Stack>

      <Box
        sx={{
          position: 'relative',
          height: rem(6),
          borderRadius: '5vh',
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            width: `${pct}%`,
            borderRadius: '5vh',
            background: tokens.red,
            boxShadow: `0 0 14px ${tokens.red}`,
            transition: 'width .3s ease',
          }}
        />
      </Box>
    </Box>
  )
}
