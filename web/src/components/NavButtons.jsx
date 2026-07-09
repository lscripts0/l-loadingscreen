import { IconButton, Stack, Tooltip } from '@mui/material'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'
import GavelRoundedIcon from '@mui/icons-material/GavelRounded'
import { tokens, rem } from '../theme'
import { useT } from '../i18n'

export const iconBtnSx = {
  width: rem(40),
  height: rem(40),
  color: '#fff',
  background: tokens.panel,
  border: `1px solid ${tokens.border}`,
  boxShadow: tokens.insetGlow,
  borderRadius: '4px',
  '&:hover': { borderColor: tokens.red, color: tokens.red, background: 'rgba(7,7,7,0.85)' },
}

export default function NavButtons({ avail, onOpen }) {
  const t = useT()
  const items = [
    { key: 'team', label: t('nav.team'), icon: <GroupsRoundedIcon fontSize="small" /> },
    { key: 'patchnotes', label: t('nav.patchnotes'), icon: <ArticleRoundedIcon fontSize="small" /> },
    { key: 'rules', label: t('nav.rules'), icon: <GavelRoundedIcon fontSize="small" /> },
  ].filter((i) => avail[i.key])

  if (!items.length) return null

  return (
    <Stack direction="row" spacing={1}>
      {items.map((i) => (
        <Tooltip key={i.key} title={i.label} arrow>
          <IconButton onClick={() => onOpen(i.key)} sx={iconBtnSx}>
            {i.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Stack>
  )
}
