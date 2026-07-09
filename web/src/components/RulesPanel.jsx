import { Box, Stack, Typography } from '@mui/material'
import Panel from './Panel'
import SectionHeader from './SectionHeader'
import { tokens, rem } from '../theme'
import { useT } from '../i18n'

function RuleRow({ n, text }) {
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
        borderLeft: `2px solid ${tokens.red}`,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: rem(28),
          textAlign: 'center',
          fontFamily: tokens.mono,
          fontSize: rem(14),
          fontWeight: 700,
          color: tokens.red,
          textShadow: `0 0 0.5rem ${tokens.red}`,
        }}
      >
        {String(n).padStart(2, '0')}
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.4 }}>
        {text}
      </Typography>
    </Stack>
  )
}

export default function RulesPanel({ rules }) {
  const t = useT()
  if (!rules || rules.enabled === false) return null

  const groups =
    Array.isArray(rules.groups) && rules.groups.length
      ? rules.groups
      : Array.isArray(rules.items) && rules.items.length
        ? [{ name: null, items: rules.items }]
        : []

  if (!groups.length) return null

  let n = 0
  return (
    <Panel dialog title={rules.title || t('nav.rules')} sx={{ width: rem(520), p: 2.25 }}>
      <Stack spacing={2.75} sx={{ height: '60vh', overflowY: 'auto', pr: 0.5 }}>
        {groups.map((g, gi) => {
          const items = Array.isArray(g.items) ? g.items : []
          return (
            <Box key={gi}>
              <SectionHeader name={g.name} />
              <Stack spacing={1}>
                {items.map((r, i) => {
                  n += 1
                  return <RuleRow key={i} n={n} text={r} />
                })}
              </Stack>
            </Box>
          )
        })}
      </Stack>
    </Panel>
  )
}
