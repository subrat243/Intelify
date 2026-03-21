import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../utils/api'
import { Badge, Icons, IOCModal, Spinner, useTheme, TYPE_COLOR, CONF_COLOR } from '../components/ui'

const IOC_TYPES = ['All', 'IP', 'URL', 'Domain', 'Hash', 'CVE', 'Email']
const CONF_LEVELS = ['All', 'Critical', 'High', 'Medium', 'Low']
const SOURCES = ['All', 'Feodo Tracker', 'URLhaus', 'ThreatFox', 'MalwareBazaar', 'CISA KEV', 'SSL Blacklist', 'Blocklist.de SSH', 'CINS Score']

export default function LiveFeed() {
  const { theme } = useTheme()
  const [iocs, setIocs] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedIOC, setSelectedIOC] = useState(null)
  const [newIds, setNewIds] = useState(new Set())

  // Filters
  const [typeFilter, setTypeFilter] = useState('All')
  const [confFilter, setConfFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')

  const pollRef = useRef(null)

  const fetchIOCs = useCallback(async (p = page) => {
    try {
      setError(null)
      const data = await api.getIOCs({ type: typeFilter, confidence: confFilter, source: sourceFilter, page: p, limit: 50 })
      setIocs(prev => {
        const prevIds = new Set(prev.map(i => i.id))
        const fresh = new Set((data.iocs || []).filter(i => !prevIds.has(i.id)).map(i => i.id))
        if (fresh.size > 0 && prev.length > 0) {
          setNewIds(fresh)
          setTimeout(() => setNewIds(new Set()), 4000)
        }
        return data.iocs || []
      })
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setLoading(false)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }, [typeFilter, confFilter, sourceFilter, page])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    fetchIOCs(1)
  }, [typeFilter, confFilter, sourceFilter, fetchIOCs])

  useEffect(() => {
    pollRef.current = setInterval(() => fetchIOCs(page), 10000)
    return () => clearInterval(pollRef.current)
  }, [fetchIOCs, page])

  const exportCSV = () => {
    const header = 'type,value,confidence,malware,source,first_seen'
    const rows = iocs.map(i => `${i.type},"${i.value}",${i.confidence},"${i.malware || ''}","${i.source}","${i.first_seen || ''}"`)
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `intelify_iocs_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Toolbar */}
      <div style={{ 
        background: theme.bgAlt, 
        border: `1px solid ${theme.border}`, 
        borderRadius: 16, 
        padding: '16px 20px', 
        marginBottom: 20, 
        display: 'flex', 
        gap: 12, 
        flexWrap: 'wrap', 
        alignItems: 'center',
        boxShadow: theme.isDark ? '0 4px 20px -4px rgba(0,0,0,0.3)' : '0 4px 12px -4px rgba(15,23,42,0.05)',
        backdropFilter: 'blur(8px)'
      }}>
        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {IOC_TYPES.slice(0, 4).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '8px 14px', borderRadius: 8, border: `1px solid ${typeFilter === t ? theme.primary + '44' : theme.border}`,
              background: typeFilter === t ? theme.primary + '11' : theme.card,
              color: typeFilter === t ? theme.primary : theme.textSecondary,
              fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
            }}>{t}</button>
          ))}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '8px 12px', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textSecondary, fontSize: 12, fontWeight: 600 }}>
            <option value="" disabled>Other Types</option>
            {IOC_TYPES.slice(4).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ width: 1, height: 24, background: theme.border }} />

        {/* Confidence select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Scope:</span>
          <select value={confFilter} onChange={e => setConfFilter(e.target.value)}
            style={{ padding: '8px 12px', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textSecondary, fontSize: 12, fontWeight: 600 }}>
            {CONF_LEVELS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Source select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Source:</span>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
            style={{ padding: '8px 12px', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textSecondary, fontSize: 12, fontWeight: 600, maxWidth: 150 }}>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Export */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button onClick={() => fetchIOCs(page)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textSecondary, fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = theme.cardHover}>
            <div style={{ width: 14, height: 14 }}><Icons.RefreshCw /></div>
            Sync
          </button>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.textSecondary, fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = theme.cardHover}>
            <div style={{ width: 14, height: 14 }}><Icons.Download /></div>
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: theme.isDark ? '0 4px 30px rgba(0,0,0,0.4)' : '0 4px 12px rgba(15,23,42,0.05)', backdropFilter: 'blur(8px)' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '90px 1fr 120px 160px 160px 110px',
          padding: '14px 24px', borderBottom: `1px solid ${theme.border}`,
          fontSize: 10, color: theme.textMuted, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          <span>Classification</span><span>Indicator / Value</span><span>Confidence</span><span>Threat Family</span><span>Source Feed</span><span>First Seen</span>
        </div>

        {/* Body */}
        {error ? (
          <div style={{ padding: 60, textAlign: 'center', fontSize: 14, color: theme.danger, fontWeight: 600 }}>
            ⚠ {error.toUpperCase()} — API OFFLINE
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 100, gap: 16 }}>
            <Spinner size={28} />
            <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500 }}>Decrypting intelligence stream...</span>
          </div>
        ) : iocs.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', fontSize: 14, color: theme.textMuted, fontWeight: 500 }}>
            No indicators found matching criteria
          </div>
        ) : (
          <div style={{ maxHeight: 'calc(100vh - 360px)', overflowY: 'auto' }}>
            {iocs.map(ioc => {
              const tc = TYPE_COLOR(theme)[ioc.type] || theme.textMuted
              const cc = CONF_COLOR(theme)[ioc.confidence] || theme.textMuted
              const isNew = newIds.has(ioc.id)
              return (
                <div
                  key={ioc.id}
                  onClick={() => setSelectedIOC(ioc)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '90px 1fr 120px 160px 160px 110px',
                    padding: '12px 24px',
                    borderBottom: `1px solid ${theme.borderLight}`,
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: isNew ? theme.accent + '08' : 'transparent',
                    animation: isNew ? 'flashNew 4s ease' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = isNew ? theme.accent + '08' : 'transparent'}
                >
                  <Badge label={ioc.type} color={tc} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 24 }}>
                    {ioc.value}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cc, boxShadow: `0 0 6px ${cc}44` }} />
                    <span style={{ fontSize: 12, color: cc, fontWeight: 600 }}>{ioc.confidence}</span>
                  </div>
                  <span style={{ fontSize: 12, color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ioc.malware || 'Unknown'}</span>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>{ioc.source}</span>
                  <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: 'var(--font-mono)' }}>{ioc.first_seen?.slice(0, 10) || '—'}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '0 8px' }}>
        <div style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500 }}>
          Displaying <span style={{ color: theme.textSecondary, fontWeight: 700 }}>{iocs.length}</span> of <span style={{ color: theme.textSecondary, fontWeight: 700 }}>{(total || 0).toLocaleString()}</span> indicators
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: Math.min(pages, 8) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); fetchIOCs(p) }} style={{
                minWidth: 32, height: 32, borderRadius: 8,
                background: page === p ? theme.primary + '11' : theme.card,
                border: `1px solid ${page === p ? theme.primary + '44' : theme.border}`,
                color: page === p ? theme.primary : theme.textSecondary,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}>{p}</button>
            ))}
            {pages > 8 && <span style={{ fontSize: 12, color: theme.textMuted, alignSelf: 'center', padding: '0 8px' }}>… {pages}</span>}
          </div>
        )}
      </div>

      {selectedIOC && <IOCModal ioc={selectedIOC} onClose={() => setSelectedIOC(null)} />}
    </div>
  )
}
