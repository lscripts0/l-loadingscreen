import { Box, Stack, Typography } from '@mui/material'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import Panel from './Panel'
import { tokens, rem } from '../theme'
import { useT } from '../i18n'

const DEFAULT_COLORS = {
  added: 'rgb(175,255,72)',
  changed: 'var(--accent, #2CB0FD)',
  fixed: 'var(--accent-soft, #6cc5fd)',
  removed: 'rgb(255,70,70)',
}

function Badge({ type, colors }) {
  const tr = useT()
  const known = colors[type] != null
  const c = colors[type] || 'rgba(255,255,255,0.6)'
  const t = { c, l: known ? tr('patchnotes.types.' + type) : (type || 'INFO').toUpperCase() }
  return (
    <Box
      sx={{
        flexShrink: 0,
        fontFamily: tokens.mono,
        fontSize: rem(10),
        lineHeight: rem(18),
        height: rem(18),
        minWidth: rem(78),
        textAlign: 'center',
        px: 0.75,
        color: t.c,
        border: `1px solid ${t.c}`,
        borderRadius: '3px',
        textShadow: `0 0 0.5rem ${t.c}`,
        whiteSpace: 'nowrap',
      }}
    >
      {t.l}
    </Box>
  )
}

function Meta({ icon, children }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'rgba(255,255,255,0.55)' }}>
      <Box sx={{ display: 'flex', color: tokens.red }}>{icon}</Box>
      <Typography sx={{ fontFamily: tokens.mono, fontSize: rem(12) }}>{children}</Typography>
    </Stack>
  )
}

function EntryRow({ e, colors }) {
  const t = { c: colors[e.type] || 'rgba(255,255,255,0.4)' }
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: '4px',
        background: 'rgba(255,255,255,0.035)',
        borderLeft: `2px solid ${t.c}`,
      }}
    >
      <Badge type={e.type} colors={colors} />
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.4 }}>
        {e.text}
      </Typography>
    </Stack>
  )
}

function Release({ rel, colors }) {
  const entries = Array.isArray(rel.entries) ? rel.entries : []
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ mb: 1.25, pb: 0.75, borderBottom: `1px solid ${tokens.border}`, flexWrap: 'wrap', rowGap: 0.5 }}
      >
        {rel.version && (
          <Typography
            sx={{
              fontFamily: tokens.mono,
              fontWeight: 700,
              fontSize: rem(14),
              color: tokens.red,
              textShadow: `0 0 0.625rem ${tokens.red}`,
            }}
          >
            {rel.version}
          </Typography>
        )}
        {rel.date && <Meta icon={<EventRoundedIcon sx={{ fontSize: rem(16) }} />}>{rel.date}</Meta>}
        {rel.time && <Meta icon={<AccessTimeRoundedIcon sx={{ fontSize: rem(16) }} />}>{rel.time}</Meta>}
      </Stack>

      <Stack spacing={1}>
        {entries.map((e, i) => (
          <EntryRow key={i} e={e} colors={colors} />
        ))}
      </Stack>
    </Box>
  )
}

export default function Patchnotes({ enabled, data }) {
  const tr = useT()
  if (enabled === false || !data) return null

  const releases =
    Array.isArray(data.releases) && data.releases.length
      ? data.releases
      : Array.isArray(data.entries) && data.entries.length
        ? [{ version: data.version, date: data.date, time: data.time, entries: data.entries }]
        : []

  if (!releases.length) return null

  const colors = { ...DEFAULT_COLORS, ...(data.colors || {}) }

  return (
    <Panel dialog title={data.title || tr('patchnotes.title')} sx={{ width: rem(560), p: 2.25 }}>
      <Stack spacing={2.75} sx={{ height: '60vh', overflowY: 'auto', pr: 0.5 }}>
        {releases.map((rel, i) => (
          <Release key={i} rel={rel} colors={colors} />
        ))}
      </Stack>
    </Panel>
  )
}
