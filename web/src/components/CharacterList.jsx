import { useRef, useState } from 'react'
import { Box, Fade, Stack, Typography } from '@mui/material'
import CharacterCard from './CharacterCard'
import { tokens, rem } from '../theme'
import { useT } from '../i18n'

function SlotButton({ slot, selected, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: rem(40),
        height: rem(40),
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        fontFamily: tokens.mono,
        fontSize: rem(18),
        fontWeight: 700,
        borderRadius: '4px',
        transition: 'color .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease',
        color: selected ? '#05121c' : tokens.red,
        background: selected ? tokens.red : tokens.panel,
        border: `1px solid ${selected ? tokens.red : tokens.border}`,
        boxShadow: selected ? `0 0 16px ${tokens.accentShadow}` : tokens.insetGlow,
        textShadow: selected ? 'none' : `0 0 12px ${tokens.red}`,
        '&:hover': {
          borderColor: tokens.red,
          background: selected ? tokens.red : 'rgba(7,7,7,0.85)',
        },
      }}
    >
      {slot}
    </Box>
  )
}

export default function CharacterList({ characters, show }) {
  const t = useT()
  const loading = characters === null
  const list = Array.isArray(characters) ? characters : []
  const empty = list.length === 0
  const [selected, setSelected] = useState(null)

  const current = selected != null ? list[selected] : null
  const lastRef = useRef(null)
  if (current) lastRef.current = current
  const display = current || lastRef.current

  return (
    <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <Typography
        variant="overline"
        sx={{ display: 'block', mb: 1.5, color: 'rgba(255,255,255,0.45)', textAlign: 'right' }}
      >
        // {t('characters.title')}
      </Typography>

      {loading && (
        <Box
          sx={{
            width: rem(160),
            height: rem(52),
            borderRadius: '4px',
            background: tokens.panel,
            border: `1px solid ${tokens.border}`,
            boxShadow: tokens.insetGlow,
            opacity: 0.5,
            animation: 'lsPulse 1.4s ease-in-out infinite',
            '@keyframes lsPulse': {
              '0%,100%': { opacity: 0.35 },
              '50%': { opacity: 0.6 },
            },
          }}
        />
      )}

      {!loading && empty && (
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          {t('characters.empty')}
        </Typography>
      )}

      {!loading && !empty && (
        <Stack spacing={2} alignItems="flex-end">
          <Stack direction="row" spacing={1}>
            {list.map((c, i) => (
              <SlotButton
                key={c.slot}
                slot={c.slot}
                selected={i === selected}
                onClick={() => setSelected((prev) => (prev === i ? null : i))}
              />
            ))}
          </Stack>

          <Fade in={!!current} timeout={200} mountOnEnter unmountOnExit appear>
            <Box>{display && <CharacterCard character={display} show={show} />}</Box>
          </Fade>
        </Stack>
      )}
    </Box>
  )
}
