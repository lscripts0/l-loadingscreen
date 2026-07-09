import { useState } from 'react'
import { Avatar, Box, Stack, Typography } from '@mui/material'
import Panel from './Panel'
import SectionHeader from './SectionHeader'
import { tokens, rem } from '../theme'

function Member({ m }) {
  const [imgOk, setImgOk] = useState(true)
  const hasImg = imgOk && !!m.image
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
      {hasImg && (
        <Avatar
          src={m.image}
          imgProps={{ onError: () => setImgOk(false) }}
          variant="rounded"
          sx={{
            width: rem(44),
            height: rem(44),
            border: `1px solid ${tokens.border}`,
          }}
        />
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" noWrap sx={{ color: '#fff', fontWeight: 700 }}>
          {m.name}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{ color: tokens.redSoft, textTransform: 'uppercase', letterSpacing: '0.14em' }}
        >
          {m.role}
        </Typography>
      </Box>
    </Stack>
  )
}

export default function TeamPanel({ team }) {
  if (!team || team.enabled === false) return null

  const groups =
    Array.isArray(team.groups) && team.groups.length
      ? team.groups
      : Array.isArray(team.members) && team.members.length
        ? [{ name: null, members: team.members }]
        : []

  if (!groups.length) return null

  return (
    <Panel dialog title={team.title || 'Team'} sx={{ width: rem(480), p: 2.25 }}>
      <Stack spacing={2.75} sx={{ height: '60vh', overflowY: 'auto', pr: 0.5 }}>
        {groups.map((g, gi) => {
          const members = Array.isArray(g.members) ? g.members : []
          return (
            <Box key={gi}>
              <SectionHeader name={g.name} />
              <Stack spacing={1}>
                {members.map((m, i) => (
                  <Member key={i} m={m} />
                ))}
              </Stack>
            </Box>
          )
        })}
      </Stack>
    </Panel>
  )
}
