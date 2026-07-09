import { createContext, useContext } from 'react'

export const EN = {
  welcome: 'Welcome',
  welcomeBack: 'Welcome back',
  characters: {
    title: 'Your Characters',
    empty: 'No characters yet. Create your first one!',
    unnamed: 'Unnamed',
    unemployed: 'Unemployed',
  },
  playtime: 'Playtime',
  nav: { team: 'Team', patchnotes: 'Patchnotes', rules: 'Rules' },
  stage: {
    connecting: 'Connecting to the server…',
    init: 'Initializing game…',
    dataFiles: 'Loading data files…',
    map: 'Loading map…',
  },
  patchnotes: {
    title: 'Patchnotes',
    types: { added: 'NEW', changed: 'CHANGED', fixed: 'FIX', removed: 'REMOVED', info: 'INFO' },
  },
  lastSeen: {
    unknown: 'unknown',
    now: 'just now',
    min: '{n} min ago',
    hour: '{n} h ago',
    day: '{n} d ago',
    month: '{n} mo ago',
    year: '{n} y ago',
  },
  sex: { male: 'Male', female: 'Female' },
}

function get(dict, path) {
  return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), dict)
}

export function makeT(dict) {
  return (key, vars) => {
    let v = get(dict, key)
    if (v == null) v = get(EN, key)
    if (v == null) return key
    if (typeof v === 'string' && vars) {
      return v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`))
    }
    return v
  }
}

export const LocaleContext = createContext(makeT(EN))
export function useT() {
  return useContext(LocaleContext)
}
