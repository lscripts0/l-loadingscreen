import { IconButton, Stack, Tooltip } from '@mui/material'
import ForumRoundedIcon from '@mui/icons-material/ForumRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import { iconBtnSx } from './NavButtons'

const ICONS = {
  discord: ForumRoundedIcon,
  shop: StorefrontRoundedIcon,
  web: LanguageRoundedIcon,
  website: LanguageRoundedIcon,
}

function openUrl(url) {
  if (!url) return
  try {
    if (window.invokeNative) {
      window.invokeNative('openUrl', url)
      return
    }
  } catch (e) {
  }
  try {
    window.open(url, '_blank')
  } catch (e) {
  }
}

export default function Social({ social }) {
  if (!social || social.enabled === false) return null
  const links = Array.isArray(social.links) ? social.links : []
  if (!links.length) return null

  return (
    <Stack direction="row" spacing={1}>
      {links.map((l, i) => {
        const Icon = ICONS[l.icon] || LinkRoundedIcon
        return (
          <Tooltip key={i} title={l.label || ''} arrow>
            <IconButton onClick={() => openUrl(l.url)} sx={iconBtnSx}>
              <Icon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      })}
    </Stack>
  )
}
