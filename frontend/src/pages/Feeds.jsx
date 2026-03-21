import { useState } from 'react'
import { usePolling } from '../hooks/usePolling'
import { api } from '../utils/api'
import { Badge, Icons, StatusDot, Spinner, IOCModal, TYPE_COLOR, CONF_COLOR, useTheme } from '../components/ui'

export default function Feeds() {
  const { theme } = useTheme()
  const { data: feeds, loading, error, refetch } = usePolling(api.getFeeds, 8000)
  const [refreshing, setRefreshing] = useState({})
  const [selectedIOC, setSelectedIOC] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [feedIOCs, setFeedIOCs] = useState({})
  const [iocLoading, setIocLoading] = useState({})

  const STATUS_COLOR = { ok: theme.success, loading: theme.warning, error: theme.danger, pending: theme.textMuted }

  const handleRefresh = async (feedId) => {
    setRefreshing(prev => ({ ...prev, [feedId]: true }))
    try {
      await api.refreshFeed(feedId)
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
        const data = await api.getIOCs({ source: feeds?.find(f => f.id === feedId)?.name, limit: 12 })
        setFeedIOCs(prev => ({ ...prev, [feedId]: data.iocs }))
      } catch {}
      setIocLoading(prev => ({ ...prev, [feedId]: false }))
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 16 }}>
      <Spinner size={32} />
      <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500 }}>Calibrating feed infrastructure...</span>
    </div>
  )

  if (error) return (
    <div style={{ padding: 60, textAlign: 'center', background: theme.card, borderRadius: 16, border: `1px solid ${theme.danger}22` }}>
      <div style={{ fontSize: 14, color: theme.danger, fontWeight: 600 }}>⚠ INFRASTRUCTURE OFFLINE</div>
      <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 12 }}>{error}</div>
    </div>
  )

  const onlineCount = (feeds || []).filter(f => f.status === 'ok').length

  return (
    <div style={{ animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '0 4px' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Feed Matrix</div>
          <div style={{ fontSize: 13, color: theme.textMuted }}>
            <span style={{ color: theme.success, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{onlineCount}</span> operational OSINT sources integrated
          </div>
        </div>
        <button onClick={handleRefreshAll} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
          background: theme.bgAlt, border: `1px solid ${theme.border}`, borderRadius: 10,
          color: theme.textSecondary, fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
        }} onMouseEnter={e => { e.currentTarget.style.background = theme.cardHover; e.currentTarget.style.borderColor = theme.primary }}>
          <div style={{ width: 16, height: 16 }}><Icons.RefreshCw /></div>
          Global Sync
        </button>
      </div>

      {/* Feed cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(feeds || []).map(feed => {
          const sc = STATUS_COLOR[feed.status] || theme.textMuted
          const isExpanded = expanded === feed.id
          const isRefreshing = refreshing[feed.id]

          return (
            <div key={feed.id} style={{
              background: theme.card, 
              border: `1px solid ${isExpanded ? theme.primary + '33' : theme.border}`,
              borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s',
              boxShadow: isExpanded ? `0 12px 30px -10px ${theme.bg}` : 'none',
              backdropFilter: 'blur(8px)'
            }}>
              {/* Feed header row */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '260px 110px 100px 1fr 120px 120px 120px', 
                gap: 16, 
                padding: '20px 24px', 
                alignItems: 'center' 
              }}>
                {/* Name + org */}
                <div>
                  <div style={{ fontSize: 14, color: theme.text, fontWeight: 600, marginBottom: 4 }}>{feed.name}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {feed.org} · <Badge label={feed.type} color={theme.secondary} />
                  </div>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusDot status={feed.status} />
                  <span style={{ fontSize: 11, color: sc, fontWeight: 700, letterSpacing: '0.04em' }}>{feed.status?.toUpperCase()}</span>
                </div>

                {/* IOC count */}
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: theme.textSecondary, fontFamily: 'var(--font-mono)' }}>
                    {feed.ioc_count > 0 ? feed.ioc_count.toLocaleString() : '—'}
                  </div>
                  <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.02em' }}>Records</div>
                </div>

                {/* Error message */}
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {feed.error && (
                    <span style={{ fontSize: 11, color: theme.danger, opacity: 0.8, fontFamily: 'var(--font-mono)' }}>⚠ {feed.error}</span>
                  )}
                </div>

                {/* Last fetch */}
                <div>
                  <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Last Sync</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary, fontFamily: 'var(--font-mono)' }}>
                    {feed.last_fetch ? new Date(feed.last_fetch).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>

                {/* Refresh interval */}
                <div>
                  <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Interval</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>{feed.refresh_interval_minutes} minutes</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleRefresh(feed.id)}
                    disabled={isRefreshing}
                    style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, 
                      padding: '8px 12px', background: theme.bgAlt, border: `1px solid ${theme.border}`, 
                      borderRadius: 8, color: isRefreshing ? theme.textMuted : theme.textSecondary, 
                      fontSize: 12, fontWeight: 600, cursor: isRefreshing ? 'not-allowed' : 'pointer'
                    }}>
                    <div style={{ width: 14, height: 14, animation: isRefreshing ? 'spin 1.2s linear infinite' : 'none' }}><Icons.RefreshCw /></div>
                    {isRefreshing ? 'Sync' : 'Sync'}
                  </button>
                  <button
                    onClick={() => toggleExpand(feed.id)}
                    style={{ 
                      padding: '8px 10px', background: theme.bgAlt, border: `1px solid ${isExpanded ? theme.primary + '33' : theme.border}`, 
                      borderRadius: 8, color: isExpanded ? theme.primary : theme.textMuted, transition: 'all 0.2s'
                    }}>
                    <div style={{ width: 14, height: 14, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><Icons.ChevronDown /></div>
                  </button>
                </div>
              </div>

              {/* Expanded: recent IOCs */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${theme.border}`, padding: '24px', background: `${theme.bg}55` }}>
                  <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>Matrix Samples: {feed.name}</div>
                  {iocLoading[feed.id] ? (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: theme.textMuted, fontSize: 13, padding: '20px 0' }}>
                      <Spinner size={18} /><span>Extracting records...</span>
                    </div>
                  ) : feedIOCs[feed.id]?.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {feedIOCs[feed.id].map(ioc => {
                        const tc = TYPE_COLOR(theme)[ioc.type] || theme.textMuted
                        const cc = CONF_COLOR(theme)[ioc.confidence] || theme.textMuted
                        return (
                          <div key={ioc.id} onClick={() => setSelectedIOC(ioc)}
                            style={{ 
                              display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', 
                              background: theme.bgAlt, borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                              border: `1px solid ${theme.borderLight}`
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.cardSolid }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.borderLight; e.currentTarget.style.background = theme.bgAlt }}>
                            <Badge label={ioc.type} color={tc} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: theme.textSecondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ioc.value}</span>
                            <Badge label={ioc.confidence} color={cc} variant="outline" />
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: theme.textMuted, padding: '20px 0' }}>Intelligence buffer empty for this source.</div>
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
