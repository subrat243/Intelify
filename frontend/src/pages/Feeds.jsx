import { useState } from 'react'
import { usePolling } from '../hooks/usePolling'
import { api } from '../utils/api'
import { Badge, Icons, StatusDot, Spinner, IOCModal, CONF_COLOR, TYPE_COLOR } from '../components/ui'

export default function Feeds() {
  const { data: feeds, loading, error, refetch } = usePolling(api.getFeeds, 8000)
  const [refreshing, setRefreshing] = useState({})
  const [selectedIOC, setSelectedIOC] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [feedIOCs, setFeedIOCs] = useState({})
  const [iocLoading, setIocLoading] = useState({})

  const STATUS_COLOR = { ok: '#00ffa3', loading: '#fbbf24', error: '#ef4444', pending: '#334155' }

  const handleRefresh = async (feedId) => {
    setRefreshing(prev => ({ ...prev, [feedId]: true }))
    try {
      await api.refreshFeed(feedId)
      // Poll until status changes from loading
      const poll = setInterval(async () => {
        await refetch()
      }, 1500)
      setTimeout(() => { clearInterval(poll); setRefreshing(prev => ({ ...prev, [feedId]: false })); refetch() }, 10000)
    } catch {
      setRefreshing(prev => ({ ...prev, [feedId]: false }))
    }
  }

  const handleRefreshAll = async () => {
    const ids = (feeds || []).map(f => f.id)
    ids.forEach(id => setRefreshing(prev => ({ ...prev, [id]: true })))
    try { await api.refreshAll() } catch {}
    setTimeout(() => {
      ids.forEach(id => setRefreshing(prev => ({ ...prev, [id]: false })))
      refetch()
    }, 12000)
  }

  const toggleExpand = async (feedId) => {
    if (expanded === feedId) { setExpanded(null); return }
    setExpanded(feedId)
    if (!feedIOCs[feedId]) {
      setIocLoading(prev => ({ ...prev, [feedId]: true }))
      try {
        const data = await api.getIOCs({ source: feeds?.find(f => f.id === feedId)?.name, limit: 10 })
        setFeedIOCs(prev => ({ ...prev, [feedId]: data.iocs }))
      } catch {}
      setIocLoading(prev => ({ ...prev, [feedId]: false }))
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, gap: 12, color: '#1e3a5f', fontSize: 12 }}>
      <Spinner /><span>Loading feed status...</span>
    </div>
  )

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center', fontSize: 12, color: '#ef4444' }}>⚠ {error}</div>
  )

  const onlineCount = (feeds || []).filter(f => f.status === 'ok').length

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: '#334155' }}>
          <span style={{ color: '#00ffa3', fontFamily: 'monospace' }}>{onlineCount}</span>
          <span style={{ color: '#1e3a5f' }}>/{feeds?.length ?? 0} feeds operational</span>
        </div>
        <button onClick={handleRefreshAll} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
          background: '#040c1a', border: '1px solid #0c1e36', borderRadius: 8,
          color: '#475569', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <div style={{ width: 14, height: 14 }}><Icons.RefreshCw /></div>
          Refresh All Feeds
        </button>
      </div>

      {/* Feed cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(feeds || []).map(feed => {
          const sc = STATUS_COLOR[feed.status] || '#334155'
          const isExpanded = expanded === feed.id
          const isRefreshing = refreshing[feed.id]

          return (
            <div key={feed.id} style={{
              background: '#040c1a', border: `1px solid ${isExpanded ? '#0c1e36' : '#08121e'}`,
              borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              {/* Feed header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '220px 100px 80px 1fr 140px 140px 130px', gap: 12, padding: '14px 18px', alignItems: 'center' }}>
                {/* Name + org */}
                <div>
                  <div style={{ fontSize: 13, color: '#c9d4e8', fontWeight: 500, marginBottom: 3 }}>{feed.name}</div>
                  <div style={{ fontSize: 10, color: '#1e3a5f' }}>{feed.org} · {feed.type}</div>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <StatusDot status={feed.status} />
                  <span style={{ fontSize: 10, color: sc, letterSpacing: '0.08em', fontFamily: 'monospace' }}>{feed.status?.toUpperCase()}</span>
                </div>

                {/* IOC count */}
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#7a93b8', fontFamily: 'monospace' }}>
                    {feed.ioc_count > 0 ? feed.ioc_count.toLocaleString() : isRefreshing ? '···' : '—'}
                  </div>
                  <div style={{ fontSize: 9, color: '#1e3a5f', letterSpacing: '0.1em' }}>IOCs</div>
                </div>

                {/* Error message */}
                <div>
                  {feed.error && (
                    <span style={{ fontSize: 10, color: '#ef444480', fontFamily: 'monospace' }}>⚠ {feed.error}</span>
                  )}
                </div>

                {/* Last fetch */}
                <div>
                  <div style={{ fontSize: 10, color: '#334155' }}>Last fetched</div>
                  <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>
                    {feed.last_fetch ? new Date(feed.last_fetch).toLocaleTimeString() : '—'}
                  </div>
                </div>

                {/* Refresh interval */}
                <div>
                  <div style={{ fontSize: 10, color: '#334155' }}>Auto-refresh</div>
                  <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>
                    every {feed.refresh_interval_minutes}m
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleRefresh(feed.id)}
                    disabled={isRefreshing}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#08121e', border: '1px solid #0c1e36', borderRadius: 6, color: isRefreshing ? '#1e3a5f' : '#475569', fontSize: 10, cursor: isRefreshing ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                    <div style={{ width: 12, height: 12, animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }}><Icons.RefreshCw /></div>
                    {isRefreshing ? 'Syncing' : 'Sync'}
                  </button>
                  <button
                    onClick={() => toggleExpand(feed.id)}
                    style={{ padding: '6px 10px', background: '#08121e', border: '1px solid #0c1e36', borderRadius: 6, color: isExpanded ? '#00ffa3' : '#334155', fontSize: 10, cursor: 'pointer' }}>
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Expanded: recent IOCs */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #08121e', padding: '14px 18px', background: '#02060f' }}>
                  <div style={{ fontSize: 9, color: '#1e3a5f', letterSpacing: '0.13em', marginBottom: 10 }}>RECENT INDICATORS FROM {feed.name.toUpperCase()}</div>
                  {iocLoading[feed.id] ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#1e3a5f', fontSize: 11 }}>
                      <Spinner size={14} /><span>Loading...</span>
                    </div>
                  ) : feedIOCs[feed.id]?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {feedIOCs[feed.id].map(ioc => {
                        const tc = TYPE_COLOR[ioc.type] || '#94a3b8'
                        const cc = CONF_COLOR[ioc.confidence] || '#94a3b8'
                        return (
                          <div key={ioc.id} onClick={() => setSelectedIOC(ioc)}
                            style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 10px', borderRadius: 6, cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#040c1a'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Badge label={ioc.type} color={tc} />
                            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ioc.value}</span>
                            <span style={{ fontSize: 10, color: '#2a4060' }}>{ioc.malware || '—'}</span>
                            <Badge label={ioc.confidence} color={cc} />
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#1e3a5f' }}>No IOCs loaded yet for this feed.</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedIOC && <IOCModal ioc={selectedIOC} onClose={() => setSelectedIOC(null)} />}
    </div>
  )
}
