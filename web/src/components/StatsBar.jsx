import { Box, Stack, Typography } from '@mui/material'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import { tokens, rem } from '../theme'

function fmtUptime(s) {
  if (typeof s !== 'number') return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function Chip({ icon, children }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{
        height: rem(40),
        px: 1.5,
        background: tokens.panel,
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.insetGlow,
        borderRadius: '4px',
      }}
    >
      <Box sx={{ color: tokens.red, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontFamily: tokens.mono, fontSize: rem(13), color: '#fff' }}>{children}</Typography>
    </Stack>
  )
}

export default function StatsBar({ stats, data }) {
  if (!stats || stats.enabled === false || !data) return null
  const showPlayers = stats.players !== false
  const showUptime = stats.uptime !== false
  if (!showPlayers && !showUptime) return null
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      {showPlayers && (
        <Chip icon={<PeopleRoundedIcon fontSize="small" />}>
          {data.players ?? '—'} / {data.maxPlayers ?? '—'}
        </Chip>
      )}
      {showUptime && (
        <Chip icon={<AccessTimeRoundedIcon fontSize="small" />}>{fmtUptime(data.uptime)}</Chip>
      )}
    </Stack>
  )
}
