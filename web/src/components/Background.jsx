import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Box, IconButton } from '@mui/material'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { tokens, rem } from '../theme'

export default function Background({ background, audio, volume }) {
  const bg = background || {}
  const images = (bg.images && bg.images.length ? bg.images : bg.image ? [bg.image] : []).filter(Boolean)
  const useVideoAudio = (audio?.source || 'none') === 'video'
  const [failed, setFailed] = useState({})
  const [idx, setIdx] = useState(0)
  const [videoSrc, setVideoSrc] = useState(null)
  const videoRef = useRef(null)

  const showVideo = bg.type === 'video' && !failed.video
  const showImages = (bg.type === 'image' || bg.type === 'images') && images.length > 0
  const blur = typeof bg.blur === 'number' ? bg.blur : 0

  useEffect(() => {
    if (!showVideo || !bg.video) return
    let url = null
    let cancelled = false
    setVideoSrc(null)
    fetch(bg.video)
      .then((r) => r.blob())
      .then((b) => {
        if (cancelled) return
        url = URL.createObjectURL(b)
        setVideoSrc(url)
      })
      .catch(() => {
        if (!cancelled) setVideoSrc(bg.video)
      })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [showVideo, bg.video])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !showVideo || !videoSrc) return
    v.muted = !useVideoAudio
    v.volume = typeof volume === 'number' ? volume : 0.4
    v.play().catch(() => {})
  }, [showVideo, useVideoAudio, volume, videoSrc])

  useEffect(() => {
    if (!showImages || images.length < 2 || !bg.interval) return
    const t = setTimeout(() => setIdx((i) => (i + 1) % images.length), bg.interval)
    return () => clearTimeout(t)
  }, [showImages, images.length, bg.interval, idx])

  const go = (d) => setIdx((i) => (i + d + images.length) % images.length)

  return (
    <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <Box
        sx={{
          position: 'absolute',
          inset: '-20%',
          background: 'linear-gradient(120deg, #0b0b10, #161018, #0e0e14, #1a0f12, #0b0b10)',
          backgroundSize: '400% 400%',
          animation: 'lsGradient 24s ease infinite',
          '@keyframes lsGradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      />

      {showVideo && (
        <Box
          component="video"
          ref={videoRef}
          src={videoSrc || undefined}
          autoPlay
          muted={!useVideoAudio}
          loop
          playsInline
          onError={() => setFailed((f) => ({ ...f, video: true }))}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: blur ? `blur(${blur}px)` : 'none',
            transform: blur ? 'scale(1.04)' : 'none',
          }}
        />
      )}

      {showImages &&
        images.map((src, i) =>
          failed[src] ? null : (
            <Box
              key={src + i}
              component="img"
              src={src}
              onError={() => setFailed((f) => ({ ...f, [src]: true }))}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: blur ? `blur(${blur}px)` : 'none',
                transform: blur ? 'scale(1.04)' : 'none',
                opacity: i === idx ? 1 : 0,
                transition: 'opacity .6s ease',
              }}
            />
          ),
        )}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120% 120% at 50% 0%,' +
            ' rgba(0,0,0,calc(var(--bg-dim, 0.6) * 0.5)) 0%,' +
            ' rgba(0,0,0,var(--bg-dim, 0.6)) 70%,' +
            ' rgba(0,0,0,min(1, calc(var(--bg-dim, 0.6) + 0.25))) 100%)',
        }}
      />

      {showImages &&
        images.length > 1 &&
        createPortal(
          <>
            <CarouselArrow side="left" onClick={() => go(-1)} />
            <CarouselArrow side="right" onClick={() => go(1)} />
          </>,
          document.body,
        )}
    </Box>
  )
}

function CarouselArrow({ side, onClick }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'fixed',
        top: '50%',
        [side]: rem(20),
        transform: 'translateY(-50%)',
        zIndex: 50,
        width: rem(44),
        height: rem(44),
        color: '#fff',
        background: tokens.panel,
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.insetGlow,
        borderRadius: '4px',
        '&:hover': { background: 'rgba(7,7,7,0.85)', borderColor: tokens.red, color: tokens.red },
      }}
    >
      {side === 'left' ? <ChevronLeftRoundedIcon /> : <ChevronRightRoundedIcon />}
    </IconButton>
  )
}
