import { useEffect, useMemo, useState } from 'react'
import { Box, Stack } from '@mui/material'
import Background from './components/Background'
import MusicPlayer from './components/MusicPlayer'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import CharacterList from './components/CharacterList'
import ProgressBar from './components/ProgressBar'
import TeamPanel from './components/TeamPanel'
import Patchnotes from './components/Patchnotes'
import RulesPanel from './components/RulesPanel'
import Motd from './components/Motd'
import Tips from './components/Tips'
import Social from './components/Social'
import NavButtons from './components/NavButtons'
import Modal from './components/Modal'
import {
  loadSettings,
  fetchJson,
  isBrowser,
  DEV_CONFIG,
  DEV_CHARACTERS,
  DEV_PATCHNOTES,
  DEV_TIPS,
  DEV_STATS,
} from './nui'
import { LocaleContext, makeT } from './i18n'
import { rem } from './theme'

export default function App() {
  const [config, setConfig] = useState(null)
  const [patchnotes, setPatchnotes] = useState(null)
  const [tips, setTips] = useState([])
  const [characters, setCharacters] = useState(null)
  const [stats, setStats] = useState(null)
  const [progress, setProgress] = useState(0)
  const [stageKey, setStageKey] = useState('connecting')
  const [stageMsg, setStageMsg] = useState('')
  const [locale, setLocale] = useState(null)
  const [volume, setVolume] = useState(0.4)
  const [openModal, setOpenModal] = useState(() => {
    const h = (window.location.hash || '').replace('#', '')
    return ['team', 'patchnotes', 'rules'].includes(h) ? h : null
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const s = (await loadSettings()) || DEV_CONFIG
      if (cancelled) return
      setConfig(s)
      if (typeof s?.audio?.volume === 'number') setVolume(s.audio.volume)
      const [pn, tp] = await Promise.all([fetchJson('patchnotes.json'), fetchJson('tips.json')])
      if (cancelled) return
      setPatchnotes(pn || (isBrowser ? DEV_PATCHNOTES : null))
      setTips((tp && tp.tips) || (isBrowser ? DEV_TIPS : []))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isBrowser) {
      setCharacters(DEV_CHARACTERS)
      setStats(DEV_STATS)
      return
    }
    let tries = 0
    let timer = null
    const read = () => {
      const ho = window.nuiHandoverData
      if (ho && Array.isArray(ho.lsCharacters)) {
        setCharacters(ho.lsCharacters)
        if (ho.lsStats) setStats(ho.lsStats)
        if (ho.lsLocale) setLocale(ho.lsLocale)
        return
      }
      tries += 1
      if (tries < 25) timer = setTimeout(read, 200)
      else setCharacters([])
    }
    read()
    return () => timer && clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handler = (event) => {
      const d = event.data || {}
      switch (d.eventName) {
        case 'loadProgress':
          setProgress(Math.round((d.loadFraction || 0) * 100))
          break
        case 'startInitFunctionOrder':
          setStageKey('init')
          setStageMsg('')
          break
        case 'startDataFileEntries':
          setStageKey('dataFiles')
          setStageMsg('')
          break
        case 'performMapLoadFunction':
          setStageKey('map')
          setStageMsg('')
          break
        case 'onLogLine':
          if (d.message) setStageMsg(String(d.message).slice(0, 80))
          break
        default:
          break
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const t = useMemo(() => makeT(locale), [locale])

  if (!config) return <Background background={DEV_CONFIG.background} />

  const hasChars = Array.isArray(characters) && characters.length > 0
  const subtitle = hasChars ? t('welcomeBack') : t('welcome')
  const charsEnabled = config.characters?.enabled !== false
  const sumGroups = (groups, key) =>
    (Array.isArray(groups) ? groups : []).reduce((a, g) => a + (g?.[key]?.length || 0), 0)
  const teamCount = (config.team?.members?.length || 0) + sumGroups(config.team?.groups, 'members')
  const rulesCount = (config.rules?.items?.length || 0) + sumGroups(config.rules?.groups, 'items')
  const pnCount = (patchnotes?.entries?.length || 0) + sumGroups(patchnotes?.releases, 'entries')
  const avail = {
    team: config.team?.enabled !== false && teamCount > 0,
    patchnotes: config.patchnotes?.enabled !== false && pnCount > 0,
    rules: config.rules?.enabled !== false && rulesCount > 0,
  }

  return (
    <LocaleContext.Provider value={t}>
    <Box sx={{ position: 'fixed', inset: 0, color: 'text.primary' }}>
      <Background background={config.background} audio={config.audio} volume={volume} />

      <Box
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 4, md: 7 },
          py: { xs: 3, md: 5 },
          boxSizing: 'border-box',
          gap: 2,
        }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
            {config.header?.enabled !== false && (
              <Header serverName={config.serverName} subtitle={subtitle} />
            )}
            <Box sx={{ mt: 2 }}>
              <Motd motd={config.motd} />
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatsBar stats={config.stats} data={stats} />
              <NavButtons avail={avail} onOpen={setOpenModal} />
            </Stack>
            {charsEnabled && <CharacterList characters={characters} show={config.show || {}} />}
          </Box>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }} />

        <Box sx={{ position: 'relative', minHeight: rem(72) }}>
          <Box sx={{ position: 'absolute', left: 0, bottom: 0 }}>
            <MusicPlayer audio={config.audio} volume={volume} onVolume={setVolume} />
          </Box>
          <Box sx={{ position: 'absolute', right: 0, bottom: 0 }}>
            <Social social={config.social} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: rem(4),
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: rem(620),
            }}
          >
            <Tips config={config.tips} tips={tips} />
            <ProgressBar value={progress} stage={stageMsg || t('stage.' + stageKey)} />
          </Box>
        </Box>
      </Box>

      <Modal open={!!openModal} onClose={() => setOpenModal(null)}>
        {openModal === 'team' && <TeamPanel team={config.team} />}
        {openModal === 'patchnotes' && <Patchnotes enabled data={patchnotes} />}
        {openModal === 'rules' && <RulesPanel rules={config.rules} />}
      </Modal>
    </Box>
    </LocaleContext.Provider>
  )
}
