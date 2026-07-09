import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, IconButton, Slider, Stack, Typography } from '@mui/material'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded'
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded'
import { tokens, rem } from '../theme'

function prettyTrack(path) {
  if (!path) return ''
  const base = String(path).split('/').pop().replace(/\.[^.]+$/, '')
  return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function fmtTime(s) {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function normalizeTrack(t) {
  if (!t) return null
  if (typeof t === 'string') return { src: t, title: prettyTrack(t), artist: '' }
  const src = t.src || t.url || t.file || t.path || ''
  if (!src) return null
  return { src, title: t.title || prettyTrack(src), artist: t.artist || '' }
}

const shell = {
  background: tokens.panel,
  border: `1px solid ${tokens.border}`,
  boxShadow: tokens.insetGlow,
  borderRadius: '4px',
  px: 1.75,
  py: 1.25,
}

function VolumeSlider({ volume, onVolume }) {
  const muted = volume <= 0
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: rem(150) }}>
      <IconButton size="small" onClick={() => onVolume(muted ? 0.4 : 0)} sx={{ color: tokens.red }}>
        {muted ? <VolumeOffRoundedIcon fontSize="small" /> : <VolumeUpRoundedIcon fontSize="small" />}
      </IconButton>
      <Slider
        size="small"
        value={Math.round((volume || 0) * 100)}
        onChange={(_, v) => onVolume((Array.isArray(v) ? v[0] : v) / 100)}
        sx={{
          color: tokens.red,
          '& .MuiSlider-thumb': { boxShadow: `0 0 8px ${tokens.red}` },
          '& .MuiSlider-rail': { backgroundColor: 'rgba(255,255,255,0.15)' },
        }}
      />
    </Stack>
  )
}

export default function MusicPlayer({ audio, volume, onVolume }) {
  const cfg = audio || {}
  const source = cfg.source || 'none'
  const showControls = cfg.controls !== false

  if (source === 'video') {
    if (!showControls) return null
    return (
      <Box sx={shell}>
        <VolumeSlider volume={volume} onVolume={onVolume} />
      </Box>
    )
  }

  if (source !== 'playlist') return null
  return <Playlist cfg={cfg} volume={volume} onVolume={onVolume} showControls={showControls} />
}

function Playlist({ cfg, volume, onVolume, showControls }) {
  const tracks = Array.isArray(cfg.tracks) ? cfg.tracks.map(normalizeTrack).filter(Boolean) : []
  const order = useMemo(() => {
    const list = tracks.slice()
    if (cfg.shuffle) {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
      }
    }
    return list
  }, [cfg.shuffle, tracks.length])

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [blobUrl, setBlobUrl] = useState(null)
  const ref = useRef(null)

  const src = (order[index] || {}).src

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.volume = typeof volume === 'number' ? volume : 0.4
  }, [volume])

  useEffect(() => {
    if (!src) return
    let url = null
    let cancelled = false
    setBlobUrl(null)
    setDuration(0)
    setCurrentTime(0)
    fetch(src)
      .then((r) => r.blob())
      .then((b) => {
        if (cancelled) return
        url = URL.createObjectURL(b)
        setBlobUrl(url)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [src])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (playing) el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    else el.pause()
  }, [playing, index, blobUrl])

  if (!order.length) return null

  const next = () => setIndex((i) => (i + 1) % order.length)
  const prev = () => setIndex((i) => (i - 1 + order.length) % order.length)
  const onEnded = () => {
    if (index < order.length - 1) next()
    else if (cfg.loop) setIndex(0)
    else setPlaying(false)
  }

  const seek = (pct) => {
    const el = ref.current
    if (!el) return
    const dur = Number.isFinite(el.duration) ? el.duration : duration
    if (dur > 0) {
      const at = (pct / 100) * dur
      el.currentTime = at
      setCurrentTime(at)
    }
  }

  const resolveDuration = (el) => {
    if (!el) return
    if (Number.isFinite(el.duration)) {
      setDuration(el.duration)
      return
    }
    const onSeek = () => {
      el.removeEventListener('timeupdate', onSeek)
      el.currentTime = 0
      setCurrentTime(0)
      setDuration(Number.isFinite(el.duration) ? el.duration : 0)
    }
    el.addEventListener('timeupdate', onSeek)
    el.currentTime = 1e7
  }

  const current = order[index] || {}
  const audioEl = (
    <audio
      ref={ref}
      src={blobUrl || undefined}
      onEnded={onEnded}
      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
      onLoadedMetadata={(e) => {
        setCurrentTime(0)
        resolveDuration(e.currentTarget)
      }}
      onDurationChange={(e) => {
        if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration)
      }}
      autoPlay
    />
  )

  if (!showControls) return audioEl

  return (
    <Box sx={{ ...shell, position: 'relative', minWidth: rem(320) }}>
      {audioEl}
      <Box
        sx={{
          position: 'absolute',
          top: rem(10),
          right: rem(12),
          display: 'flex',
          alignItems: 'baseline',
          gap: rem(3),
          fontFamily: tokens.mono,
          fontSize: rem(11),
          lineHeight: 1,
          letterSpacing: '0.08em',
        }}
      >
        <Box component="span" sx={{ color: tokens.red, fontWeight: 700 }}>
          {String(index + 1).padStart(2, '0')}
        </Box>
        <Box component="span" sx={{ color: 'rgba(255,255,255,0.3)' }}>/</Box>
        <Box component="span" sx={{ color: 'rgba(255,255,255,0.45)' }}>
          {String(order.length).padStart(2, '0')}
        </Box>
      </Box>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ pr: rem(34) }}>
        <Box sx={{ color: tokens.red, display: 'flex' }}>
          <MusicNoteRoundedIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" noWrap sx={{ color: '#fff', fontWeight: 600 }}>
            {current.title}
          </Typography>
          {current.artist && (
            <Typography
              variant="caption"
              noWrap
              component="div"
              sx={{ color: tokens.redSoft, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              {current.artist}
            </Typography>
          )}
        </Box>
      </Stack>

      <Box sx={{ mt: 0.75 }}>
        <Slider
          size="small"
          value={duration ? Math.min(100, (currentTime / duration) * 100) : 0}
          onChange={(_, v) => seek(Array.isArray(v) ? v[0] : v)}
          sx={{
            color: tokens.red,
            py: rem(6),
            '& .MuiSlider-rail': { backgroundColor: 'rgba(255,255,255,0.15)' },
            '& .MuiSlider-thumb': {
              width: rem(10),
              height: rem(10),
              boxShadow: `0 0 8px ${tokens.red}`,
            },
          }}
        />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: -0.5 }}>
          <Typography sx={{ fontFamily: tokens.mono, fontSize: rem(10), color: 'rgba(255,255,255,0.5)' }}>
            {fmtTime(currentTime)}
          </Typography>
          <Typography sx={{ fontFamily: tokens.mono, fontSize: rem(10), color: 'rgba(255,255,255,0.5)' }}>
            {fmtTime(duration)}
          </Typography>
        </Stack>
      </Box>

      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
        <IconButton size="small" onClick={prev} sx={{ color: '#fff' }}>
          <SkipPreviousRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={() => setPlaying((p) => !p)}
          sx={{
            color: '#05121c',
            background: tokens.red,
            boxShadow: `0 0 14px ${tokens.red}`,
            '&:hover': { background: tokens.redSoft },
          }}
        >
          {playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        </IconButton>
        <IconButton size="small" onClick={next} sx={{ color: '#fff' }}>
          <SkipNextRoundedIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, pl: 1 }}>
          <VolumeSlider volume={volume} onVolume={onVolume} />
        </Box>
      </Stack>
    </Box>
  )
}
