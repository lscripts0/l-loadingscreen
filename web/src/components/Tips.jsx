import { useEffect, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded'
import { tokens } from '../theme'

export default function Tips({ config, tips }) {
  const list = Array.isArray(tips) ? tips.filter(Boolean) : []
  const [i, setI] = useState(0)
  const [show, setShow] = useState(true)

  const enabled = config && config.enabled !== false && list.length > 0
  const interval = config?.interval || 6000

  useEffect(() => {
    if (!enabled || list.length < 2) return
    const t = setInterval(() => {
      setShow(false)
      setTimeout(() => {
        setI((p) => (p + 1) % list.length)
        setShow(true)
      }, 350)
    }, interval)
    return () => clearInterval(t)
  }, [enabled, list.length, interval])

  if (!enabled) return null

  return (
    <Stack direction="row" justifyContent="center" sx={{ mb: 1.25 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ opacity: show ? 1 : 0, transition: 'opacity .35s ease' }}
      >
        <Box sx={{ color: tokens.red, display: 'flex' }}>
          <TipsAndUpdatesRoundedIcon fontSize="small" />
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.8)',
            textShadow: '0 1px 8px rgba(0,0,0,0.8)',
          }}
        >
          {list[i]}
        </Typography>
      </Stack>
    </Stack>
  )
}
