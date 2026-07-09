import { Typography } from '@mui/material'
import Panel from './Panel'
import { rem } from '../theme'

export default function Motd({ motd }) {
  if (!motd || motd.enabled === false || !motd.text) return null
  return (
    <Panel title={motd.title || 'Message of the Day'} sx={{ maxWidth: rem(380) }}>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
        {motd.text}
      </Typography>
    </Panel>
  )
}
