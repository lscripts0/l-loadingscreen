import { Box, Stack, Typography } from '@mui/material'
import { tokens, rem } from '../theme'

export default function SectionHeader({ name }) {
  if (!name) return null
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ mb: 1.25, pb: 0.75, borderBottom: `1px solid ${tokens.border}` }}
    >
      <Box sx={{ width: '3px', height: rem(14), background: tokens.red, boxShadow: `0 0 0.625rem ${tokens.red}` }} />
      <Typography
        sx={{
          flex: 1,
          fontWeight: 700,
          fontSize: rem(13),
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#fff',
        }}
      >
        {name}
      </Typography>
    </Stack>
  )
}
