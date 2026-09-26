import { useState } from 'react'
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
  const theme = THEMES.light

  const PAGE_TITLES = {
    dashboard: 'Intelligence Overview',
    live: 'Real-time IOC Stream',
    search: 'Threat Explorer',
    feeds: 'Feed Infrastructure',
  }

  const GLOBAL_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

    :root {
      --font-sans: 'DM Sans', system-ui, -apple-system, sans-serif;
      --font-mono: 'IBM Plex Mono', monospace;
    }

    body {
      margin: 0;
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: ${theme.bg};
      background-image: linear-gradient(${theme.borderLight} 1px, transparent 1px), linear-gradient(90deg, ${theme.borderLight} 1px, transparent 1px);
      background-size: 48px 48px;
      color: ${theme.text};
      transition: background 0.2s, color 0.2s;
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
    .dashboard-feed-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ioc-grid { grid-template-columns: 90px minmax(180px, 1fr) 120px 160px 160px 110px; }
    .feed-grid { grid-template-columns: 260px 110px 100px minmax(120px, 1fr) 120px 120px 120px; }

    @media (max-width: 900px) {
      aside { width: 100% !important; }
      .topbar-title { padding: 0 12px !important; }
      .topbar-actions { padding: 8px 14px !important; gap: 12px !important; }
      main > div { padding: 20px !important; }
      .dashboard-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .dashboard-chart-grid, .dashboard-detail-grid { grid-template-columns: 1fr; }
      .dashboard-feed-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .feed-grid { grid-template-columns: 1.5fr 100px 80px minmax(80px, 1fr) 100px 100px 110px; gap: 8px !important; padding-left: 16px !important; padding-right: 16px !important; }
    }

    @media (max-width: 640px) {
      aside { height: 60px !important; }
      aside > div:first-child { padding: 14px 16px !important; }
      aside > div:first-child > div > div:last-child, aside > div:last-child { display: none !important; }
      aside nav { overflow-x: auto; padding: 6px 8px !important; }
      aside nav button { flex-shrink: 0; padding: 8px 10px !important; }
      aside nav button > div:last-child { display: none; }
      .topbar-title { display: none; }
      .topbar-actions { padding: 8px 12px !important; gap: 8px !important; }
      .topbar-actions > div:nth-child(1), .topbar-actions > div:nth-child(2) { display: none !important; }
      main > div { padding: 14px !important; }
      .dashboard-stat-grid { gap: 10px !important; }
      .dashboard-feed-grid { grid-template-columns: 1fr !important; }
      .ioc-grid { grid-template-columns: 70px minmax(180px, 1fr) 100px; padding-left: 14px !important; padding-right: 14px !important; }
      .ioc-grid > :nth-child(4), .ioc-grid > :nth-child(5), .ioc-grid > :nth-child(6) { display: none; }
      .feed-grid { display: flex !important; flex-wrap: wrap; gap: 12px !important; }
      .feed-grid > :first-child { flex: 1 1 100%; }
      .feed-grid > :nth-child(4) { display: none; }
    }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `

  return (
    <ThemeContext.Provider value={{ theme }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: theme.bg, overflow: 'hidden' }}>
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside style={{
          width: '100%', height: 72, background: theme.bgAlt, borderBottom: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: '32px 24px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: theme.primary, width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#fff', width: 18, height: 18 }}><Icons.Shield /></div>
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
          <nav style={{ padding: '8px 12px', flex: 1, display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
            {NAV_ITEMS.map(item => {
              const active = page === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: 'auto',
                    padding: '10px 14px', borderRadius: 8, border: 'none', marginBottom: 0,
                    background: active ? theme.navActive : 'transparent',
                    color: active ? theme.text : theme.textSecondary,
                    fontSize: 13, fontWeight: active ? 600 : 500, transition: 'all 0.2s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = theme.navHover; e.currentTarget.style.color = theme.text }}
                  onMouseLeave={e => { e.currentTarget.style.background = active ? theme.navActive : 'transparent'; e.currentTarget.style.color = active ? theme.text : theme.textSecondary }}
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

          <div className="topbar-title" style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', padding: '0 24px' }}>
            {PAGE_TITLES[page]}
          </div>

          {/* Footer */}
          <div className="topbar-actions" style={{ padding: '12px 24px', borderLeft: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.success, boxShadow: `0 0 8px ${theme.success}` }} />
              <span style={{ fontSize: 11, color: theme.textSecondary, fontWeight: 500 }}>System Nominal</span>
            </div>
            <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.6 }}>
              v1.0.4 · Production
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${theme.success}11`, padding: '4px 10px', borderRadius: 20, border: `1px solid ${theme.success}22` }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.success, display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 10, color: theme.success, fontWeight: 700, letterSpacing: '0.05em' }}>LIVE FEED ACTIVE</span>
            </div>
            <a
              href="https://github.com/subrat243/Intelify"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: theme.textMuted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Docs ↗
            </a>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────────────────── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
