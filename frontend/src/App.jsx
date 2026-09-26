import { useState, useMemo } from 'react'
import Dashboard from './pages/Dashboard'
import LiveFeed from './pages/LiveFeed'
import Search from './pages/Search'
import Feeds from './pages/Feeds'
import { Icons, THEMES, ThemeContext } from './components/ui'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Activity },
  { id: 'live', label: 'Live Intel', icon: Icons.Zap },
  { id: 'search', label: 'Search', icon: Icons.Search },
  { id: 'feeds', label: 'Operations', icon: Icons.Database },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [themeMode, setThemeMode] = useState('dark')

  const theme = useMemo(() => THEMES[themeMode], [themeMode])

  const PAGE_TITLES = {
    dashboard: 'Intelligence Overview',
    live: 'Real-time IOC Stream',
    search: 'Threat Explorer',
    feeds: 'Feed Infrastructure',
  }

  const GLOBAL_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    body {
      margin: 0;
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: ${theme.bg};
      color: ${theme.text};
      transition: background 0.3s, color 0.3s;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ping { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
    @keyframes flashNew { 0%{background:${theme.accent}15} 100%{background:transparent} }

    button { cursor: pointer; font-family: inherit; }
    * { box-sizing: border-box; }

    .dashboard-stat-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .dashboard-chart-grid, .dashboard-detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ioc-grid { grid-template-columns: 90px minmax(180px, 1fr) 120px 160px 160px 110px; }
    .feed-grid { grid-template-columns: 260px 110px 100px minmax(120px, 1fr) 120px 120px 120px; }

    @media (max-width: 900px) {
      aside { width: 190px !important; }
      main > header { padding: 0 20px !important; }
      main > div { padding: 20px !important; }
      .dashboard-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .dashboard-chart-grid, .dashboard-detail-grid { grid-template-columns: 1fr; }
      .feed-grid { grid-template-columns: 1.5fr 100px 80px minmax(80px, 1fr) 100px 100px 110px; gap: 8px !important; padding-left: 16px !important; padding-right: 16px !important; }
    }

    @media (max-width: 640px) {
      aside { width: 64px !important; }
      aside nav button { justify-content: center; padding-left: 10px !important; padding-right: 10px !important; }
      aside nav button > div:last-child, aside nav button > div + *, aside nav button { font-size: 0 !important; }
      aside nav button > div:first-child { font-size: initial !important; }
      aside > div:first-child { padding: 20px 16px !important; }
      aside > div:first-child > div > div:last-child, aside > div:last-child { display: none !important; }
      main > header { padding: 0 14px !important; }
      main > header a { display: none !important; }
      main > div { padding: 14px !important; }
      .dashboard-stat-grid { gap: 10px !important; }
      .ioc-grid { grid-template-columns: 70px minmax(180px, 1fr) 100px; padding-left: 14px !important; padding-right: 14px !important; }
      .ioc-grid > :nth-child(4), .ioc-grid > :nth-child(5), .ioc-grid > :nth-child(6) { display: none; }
      .feed-grid { display: flex !important; flex-wrap: wrap; gap: 12px !important; }
      .feed-grid > :first-child { flex: 1 1 100%; }
      .feed-grid > :nth-child(4) { display: none; }
    }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${theme.isDark ? '#334155' : '#cbd5e1'}; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: ${theme.isDark ? '#475569' : '#94a3b8'}; }
  `

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode, mode: themeMode }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ display: 'flex', height: '100vh', background: theme.bg, overflow: 'hidden' }}>
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside style={{
          width: 240, background: theme.bgAlt, borderRight: `1px solid ${theme.border}`,
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: '32px 24px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 16px -4px ${theme.primary}44` }}>
                <div style={{ color: theme.isDark ? theme.bg : '#fff', width: 18, height: 18 }}><Icons.Shield /></div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, letterSpacing: '-0.01em' }}>
                  Intelify
                </div>
                <div style={{ fontSize: 10, color: theme.textMuted, letterSpacing: '0.04em', fontWeight: 500 }}>OSINT PLATFORM</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '8px 12px', flex: 1 }}>
            {NAV_ITEMS.map(item => {
              const active = page === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '10px 14px', borderRadius: 10, border: 'none', marginBottom: 4,
                    background: active ? (theme.isDark ? '#1e293b44' : '#e2e8f088') : 'transparent',
                    color: active ? theme.text : theme.textSecondary,
                    fontSize: 13, fontWeight: active ? 600 : 500, transition: 'all 0.2s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = theme.isDark ? '#1e293b22' : '#f1f5f9'; e.currentTarget.style.color = theme.text }}
                  onMouseLeave={e => { e.currentTarget.style.background = active ? (theme.isDark ? '#1e293b44' : '#e2e8f088') : 'transparent'; e.currentTarget.style.color = active ? theme.text : theme.textSecondary }}
                >
                  <div style={{ width: 18, height: 18, color: active ? theme.accent : 'inherit', flexShrink: 0 }}>
                    <item.icon />
                  </div>
                  {item.label}
                  {active && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} />}
                </button>
              )
            })}
          </nav>

          {/* Theme Toggle bottom of nav */}
          <div style={{ padding: '8px 12px' }}>
            <button
              onClick={() => setThemeMode(theme.isDark ? 'light' : 'dark')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                padding: '10px 14px', borderRadius: 10, border: `1px solid ${theme.border}`,
                background: 'transparent', color: theme.textSecondary, fontSize: 13, fontWeight: 500, transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.color = theme.text }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary }}
            >
              <div style={{ width: 18, height: 18, flexShrink: 0 }}>
                {theme.isDark ? <Icons.Sun /> : <Icons.Moon />}
              </div>
              {theme.isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          {/* Footer */}
          <div style={{ padding: '20px 24px', borderTop: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.success, boxShadow: `0 0 8px ${theme.success}` }} />
              <span style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 500 }}>System Nominal</span>
            </div>
            <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.6 }}>
              v1.0.4 · Production
            </div>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────────────────── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <header style={{
            height: 64, borderBottom: `1px solid ${theme.border}`, background: theme.isDark ? 'rgba(2,6,23,0.7)' : 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', flexShrink: 0, backdropFilter: 'blur(12px)', zIndex: 10
          }}>
            <h1 style={{ fontSize: 15, color: theme.textSecondary, fontWeight: 600, margin: 0 }}>{PAGE_TITLES[page]}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${theme.success}11`, padding: '4px 10px', borderRadius: 20, border: `1px solid ${theme.success}22` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.success, display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 10, color: theme.success, fontWeight: 700, letterSpacing: '0.05em' }}>LIVE FEED ACTIVE</span>
              </div>
              <a
                href="https://github.com/subrat243/Intelify"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: theme.textMuted, textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                onMouseEnter={e => e.currentTarget.style.color = theme.textSecondary}
                onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
              >
                Docs ↗
              </a>
            </div>
          </header>

          {/* Page content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {page === 'dashboard' && <Dashboard />}
              {page === 'live' && <LiveFeed />}
              {page === 'search' && <Search />}
              {page === 'feeds' && <Feeds />}
            </div>
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  )
}
