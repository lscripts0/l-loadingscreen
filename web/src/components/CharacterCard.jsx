import { Box, Stack, Typography } from '@mui/material'
import WorkRoundedIcon from '@mui/icons-material/WorkRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import CakeRoundedIcon from '@mui/icons-material/CakeRounded'
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded'
import { tokens, rem } from '../theme'
import { formatMoney, formatLastSeen, formatPlaytime, sexLabel } from '../format'
import { useT } from '../i18n'

function Row({ icon, color, glow, children }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ display: 'flex', color: color || tokens.red, opacity: 0.95 }}>{icon}</Box>
      <Typography
        variant="body2"
        sx={{
          color: color || 'rgba(255,255,255,0.9)',
          textShadow: glow ? `0 0 12px ${glow}` : 'none',
          fontFamily: color ? tokens.mono : 'inherit',
          letterSpacing: color ? '0.02em' : 0,
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </Typography>
    </Stack>
  )
}

export default function CharacterCard({ character, show }) {
  const t = useT()
  const c = character || {}
  const name = `${c.firstname || ''} ${c.lastname || ''}`.trim() || t('characters.unnamed')
  const job = [c.jobLabel, c.gradeLabel].filter(Boolean).join(' · ')

  return (
    <Box
      sx={{
        width: rem(320),
        p: 2,
        background: tokens.panel,
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.insetGlow,
        borderRadius: '4px',
        transition: 'border-color .2s ease, box-shadow .2s ease',
        '&:hover': {
          borderColor: tokens.red,
          boxShadow: `${tokens.insetGlow}, 0 0 18px rgba(var(--accent-rgb, 44,176,253),0.18)`,
        },
      }}
    >
      <Box sx={{ minWidth: 0, mb: 1.5 }}>
        <Typography variant="h6" noWrap sx={{ color: '#fff', lineHeight: 1.15 }}>
          {name}
        </Typography>
      </Box>

      <Box sx={{ height: '1px', background: tokens.border, mb: 1.5 }} />

      <Stack spacing={1}>
        {show.job && <Row icon={<WorkRoundedIcon fontSize="small" />}>{job || t('characters.unemployed')}</Row>}

        {show.money && (
          <Stack direction="row" spacing={2.5}>
            <Row
              icon={<PaymentsRoundedIcon fontSize="small" />}
              color={tokens.money}
              glow={tokens.moneyShadow}
            >
              {formatMoney(c.money)}
            </Row>
            <Row
              icon={<AccountBalanceRoundedIcon fontSize="small" />}
              color={tokens.red}
              glow={tokens.accentShadow}
            >
              {formatMoney(c.bank)}
            </Row>
          </Stack>
        )}

        {show.playtime !== false && c.playtime > 0 && (
          <Row icon={<SportsEsportsRoundedIcon fontSize="small" />}>
            {`${t('playtime')}: ${formatPlaytime(c.playtime)}`}
          </Row>
        )}

        {show.lastSeen && (
          <Row icon={<ScheduleRoundedIcon fontSize="small" />}>
            {formatLastSeen(c.lastSeen, c.serverNow, t)}
          </Row>
        )}

        {show.birthdate && (c.dateofbirth || c.sex) && (
          <Row icon={<CakeRoundedIcon fontSize="small" />}>
            {[c.dateofbirth, sexLabel(c.sex, t)].filter(Boolean).join('  ·  ')}
          </Row>
        )}
      </Stack>
    </Box>
  )
}
