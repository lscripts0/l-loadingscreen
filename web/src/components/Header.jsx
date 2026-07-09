import { Box, Stack, Typography } from '@mui/material'
import { tokens, rem } from '../theme'

export default function Header({ serverName, subtitle }) {
  return (
    <Stack direction="row" spacing={2} alignItems="stretch">
      <Box
        sx={{
          width: rem(4),
          borderRadius: '2px',
          background: tokens.red,
          boxShadow: `0 0 14px ${tokens.red}`,
        }}
      />
      <Box>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            mb: 0.5,
            color: tokens.red,
            textShadow: `0 0 14px ${tokens.red}`,
          }}
        >
          {subtitle}
        </Typography>
        <Typography
          variant="h3"
          sx={{ color: '#fff', textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
        >
          {serverName}
        </Typography>
      </Box>
    </Stack>
  )
}
