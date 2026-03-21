import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import LiveFeed from './pages/LiveFeed'
import Search from './pages/Search'
import Feeds from './pages/Feeds'
import { Icons } from './components/ui'

const GLOBAL_STYLES = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
  @keyframes flashNew { 0%{background:#00ffa310} 100%{background:transparent} }
  button { cursor: pointer; }
  * { box-sizing: border-box; }
  input, select, textarea { outline: none; }
  input::placeholder, textarea::placeholder { color: #1e3a5f; }
`

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Activity },
  { id: 'live', label: 'Live Feed', icon: Icons.Zap },
  { id: 'search', label: 'Search IOCs', icon: Icons.Search },
  { id: 'feeds', label: 'Feed Status', icon: Icons.Database },
]

export default function App() {
  const [page, setPage] = useState('dashboard')

  const PAGE_TITLES = {
    dashboard: 'Overview',
    live: 'Live Threat Feed',
    search: 'IOC Search',
    feeds: 'Feed Management',
  }

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ display: 'flex', height: '100vh', background: '#02060f', overflow: 'hidden' }}>
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside style={{
          width: 220, background: '#020810', borderRight: '1px solid #080f1e',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #080f1e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ color: '#00ffa3', width: 22, height: 22 }}><Icons.Shield /></div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e8f0ff', letterSpacing: '0.07em', fontFamily: "'IBM Plex Mono', monospace" }}>
                  THREAT<span style={{ color: '#00ffa3' }}>INTEL</span>
                </div>
                <div style={{ fontSize: 8, color: '#0c1e36', letterSpacing: '0.16em' }}>OPEN-SOURCE CTI</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '14px 10px', flex: 1 }}>
            {NAV_ITEMS.map(item => {
              const active = page === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '9px 12px', borderRadius: 7, border: 'none', marginBottom: 2,
                    background: active ? '#0c1e36' : 'transparent',
                    color: active ? '#e8f0ff' : '#334155',
                    fontSize: 12, transition: 'all 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#070f1a'; e.currentTarget.style.color = '#64748b' }}
                  onMouseLeave={e => { e.currentTarget.style.background = active ? '#0c1e36' : 'transparent'; e.currentTarget.style.color = active ? '#e8f0ff' : '#334155' }}
                >
                  <div style={{ width: 15, height: 15, color: active ? '#00ffa3' : 'inherit', flexShrink: 0 }}>
                    <item.icon />
                  </div>
                  {item.label}
                  {active && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: '#00ffa3' }} />}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid #080f1e' }}>
            <div style={{ fontSize: 9, color: '#0c1e36', lineHeight: 1.7 }}>
              <div>Feodo Tracker · URLhaus</div>
              <div>ThreatFox · MalwareBazaar</div>
              <div>CISA KEV · SSL Blacklist</div>
              <div>Blocklist.de · CINS Score</div>
            </div>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────────────────── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{
            height: 52, borderBottom: '1px solid #080f1e', background: '#020810',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 28px', flexShrink: 0,
          }}>
            <div style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{PAGE_TITLES[page]}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ffa3', display: 'inline-block', animation: 'pulse 2.5s infinite', boxShadow: '0 0 6px #00ffa3' }} />
                <span style={{ fontSize: 9, color: '#00ffa3', letterSpacing: '0.12em', fontFamily: 'monospace' }}>LIVE</span>
              </div>
              <a
                href="https://github.com/yourusername/threatintel-os"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 10, color: '#1e3a5f', textDecoration: 'none', fontFamily: 'monospace' }}
              >
                GitHub ↗
              </a>
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {page === 'dashboard' && <Dashboard />}
            {page === 'live' && <LiveFeed />}
            {page === 'search' && <Search />}
            {page === 'feeds' && <Feeds />}
          </div>
        </main>
      </div>
    </>
  )
}
