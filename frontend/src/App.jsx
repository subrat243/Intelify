import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import LiveFeed from './pages/LiveFeed'
import Search from './pages/Search'
import Feeds from './pages/Feeds'
import { Icons, THEMES, ThemeContext } from './components/ui'

const NAV_ITEMS = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: Icons.Activity },
  { id: 'live', path: '/live', label: 'Live Intel', icon: Icons.Zap },
  { id: 'search', path: '/search', label: 'Search', icon: Icons.Search },
  { id: 'feeds', path: '/feeds', label: 'Operations', icon: Icons.Database },
]

function AppLayout() {
  const location = useLocation()
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
    .live-feed-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 20px; align-items: start; }
    .live-toolbar { display: flex !important; flex-direction: column; align-items: stretch !important; min-width: 0; overflow: hidden; margin-bottom: 0 !important; }
    .live-toolbar > div { width: auto !important; height: auto !important; }
    .live-toolbar > div:first-child { display: flex; flex-wrap: wrap; }
    .live-toolbar > div:first-child button { flex: 1 1 70px; }
    .live-toolbar select { width: 100%; max-width: none !important; }
    .live-toolbar > div:last-child { margin-left: 0 !important; flex-direction: column; }
    .live-toolbar > div:last-child button { justify-content: center; }
    .live-table, .live-pagination { grid-column: 2; }
    .live-table { display: flex; flex-direction: column; height: calc(100vh - 210px); min-height: 460px; }
    .live-table > div:last-child { flex: 1; min-height: 0; max-height: none !important; }
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
      .live-feed-layout { grid-template-columns: 180px minmax(0, 1fr); gap: 14px; }
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
      .live-feed-layout { display: block; }
      .live-toolbar { margin-bottom: 14px !important; }
      .live-table { height: auto; min-height: 460px; }
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

  const activeItem = NAV_ITEMS.find(item => item.path === location.pathname) || NAV_ITEMS[0]

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
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10, width: 'auto',
                    padding: '10px 14px', borderRadius: 8, border: 'none', marginBottom: 0,
                    background: isActive ? theme.navActive : 'transparent',
                    color: isActive ? theme.text : theme.textSecondary,
                    fontSize: 13, fontWeight: isActive ? 600 : 500, transition: 'all 0.2s', textAlign: 'left',
                    textDecoration: 'none',
                  })}
                >
                  <div style={{ width: 18, height: 18, color: 'inherit', flexShrink: 0 }}>
                    <item.icon />
                  </div>
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="topbar-title" style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', padding: '0 24px' }}>
            {PAGE_TITLES[activeItem.id]}
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
            <div style={{ width: '100%', maxWidth: 1440, margin: '0 auto' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/live" element={<LiveFeed />} />
                <Route path="/search" element={<Search />} />
                <Route path="/feeds" element={<Feeds />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
