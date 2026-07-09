export const isBrowser = !window.invokeNative

export async function fetchJson(file) {
  for (const url of [file, './' + file, '../' + file]) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        return await res.json()
      }
    } catch (e) {
    }
  }
  return null
}

export const loadSettings = () => fetchJson('settings.json')

export const DEV_CONFIG = {
  serverName: 'LSCRIPTS - DEV',
  header: { enabled: true },
  background: { type: 'gradient', video: 'media/bg.mp4', images: [], blur: 3 },
  audio: { source: 'none', volume: 0.4, loop: true, shuffle: false, controls: true, tracks: [] },
  show: { job: true, money: true, playtime: true, lastSeen: true, birthdate: true },
  team: {
    enabled: true,
    title: 'Our Team',
    groups: [
      { name: 'Management', members: [{ name: 'Nico', role: 'Owner', image: '' }] },
      { name: 'Development', members: [{ name: 'Max Muster', role: 'Developer', image: '' }] },
      { name: 'Support', members: [{ name: 'Lisa', role: 'Supporter', image: '' }] },
    ],
  },
  motd: { enabled: true, title: 'Message of the Day', text: 'Welcome to the server! Enjoy your roleplay.' },
  patchnotes: { enabled: true },
  stats: { enabled: true, players: true, uptime: true },
  rules: {
    enabled: true,
    title: 'Server Rules',
    groups: [
      { name: 'General', items: ['Be respectful.', 'Follow the instructions of the team.'] },
      { name: 'Roleplay', items: ['Stay in character (IC).', 'No RDM / VDM.'] },
    ],
  },
  tips: { enabled: true, interval: 6000 },
  social: {
    enabled: true,
    links: [
      { label: 'Discord', icon: 'discord', url: 'https://discord.gg/yourserver' },
      { label: 'Shop', icon: 'shop', url: 'https://shop.yourserver.com' },
      { label: 'Website', icon: 'web', url: 'https://yourserver.com' },
    ],
  },
}

export const DEV_TIPS = [
  'Use /report to reach the team.',
  'Press F1 to open the main menu.',
  'Stay in character — better RP for everyone.',
]

export const DEV_STATS = { players: 24, maxPlayers: 64, uptime: 8040 }

export const DEV_PATCHNOTES = {
  title: 'Patchnotes',
  releases: [
    {
      version: 'v1.2.0',
      date: '16.06.2026',
      time: '14:30',
      entries: [
        { type: 'added', text: 'New loading screen with team panel and patchnotes.' },
        { type: 'changed', text: 'New design in the server style.' },
        { type: 'fixed', text: 'Various minor bugs fixed.' },
      ],
    },
    {
      version: 'v1.1.0',
      date: '10.06.2026',
      time: '18:00',
      entries: [
        { type: 'added', text: 'Added a drug system with labs.' },
        { type: 'removed', text: 'Removed the old tutorial area.' },
      ],
    },
  ],
}

const now = Math.floor(Date.now() / 1000)
export const DEV_CHARACTERS = [
  { slot: 1, firstname: 'Test', lastname: 'Server', jobLabel: 'Unemployed', gradeLabel: null,
    money: 0, bank: 400, dateofbirth: '01/01/2000', sex: 'm', playtime: 28873, lastSeen: now - 5400, serverNow: now },
  { slot: 2, firstname: 'Teeet', lastname: 'Teeet', jobLabel: 'Police', gradeLabel: 'Sergeant',
    money: 10000000, bank: 10051200, dateofbirth: '02/01/2000', sex: 'm', playtime: 2677, lastSeen: now - 120, serverNow: now },
]
