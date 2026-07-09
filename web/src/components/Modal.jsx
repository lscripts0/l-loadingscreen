import { useEffect } from 'react'
import { Box, IconButton } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { tokens, rem } from '../theme'

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'relative',
          background: tokens.panel,
          border: `1px dashed ${tokens.border}`,
          boxShadow: `${tokens.insetGlow}, 0 24px 70px rgba(0,0,0,0.7)`,
          borderRadius: '4px',
          animation: 'lsModalIn .18s ease',
          '@keyframes lsModalIn': {
            from: { opacity: 0, transform: 'scale(0.96)' },
            to: { opacity: 1, transform: 'scale(1)' },
          },
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: rem(12),
            right: rem(12),
            zIndex: 2,
            color: tokens.danger,
            background: 'rgba(255,70,70,0.08)',
            border: `1px solid ${tokens.danger}`,
            borderRadius: '4px',
            p: 0.5,
            '&:hover': {
              borderColor: tokens.dangerSoft,
              color: tokens.dangerSoft,
              background: 'rgba(255,70,70,0.16)',
            },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
        {children}
      </Box>
    </Box>
  )
}
