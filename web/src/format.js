const money = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
export function formatMoney(n) {
  return `${money.format(Number(n) || 0)} $`
}

export function formatLastSeen(lastSeen, serverNow, t) {
  const tr = t || ((k) => k)
  if (!lastSeen) return tr('lastSeen.unknown')
  const ref = serverNow || Math.floor(Date.now() / 1000)
  const d = Math.max(0, ref - lastSeen)

  if (d < 60) return tr('lastSeen.now')
  const mins = Math.floor(d / 60)
  if (mins < 60) return tr('lastSeen.min', { n: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return tr('lastSeen.hour', { n: hours })
  const days = Math.floor(hours / 24)
  if (days < 30) return tr('lastSeen.day', { n: days })
  const months = Math.floor(days / 30)
  if (months < 12) return tr('lastSeen.month', { n: months })
  const years = Math.floor(months / 12)
  return tr('lastSeen.year', { n: years })
}

export function formatPlaytime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function sexLabel(sex, t) {
  const tr = t || ((k) => k)
  if (!sex) return ''
  const s = String(sex).toLowerCase()
  if (s === 'm' || s === 'male') return tr('sex.male')
  if (s === 'f' || s === 'w' || s === 'female') return tr('sex.female')
  return sex
}
