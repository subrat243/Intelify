import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../utils/api'
import { Badge, Icons, IOCModal, Spinner, CONF_COLOR, TYPE_COLOR } from '../components/ui'

const IOC_TYPES = ['All', 'IP', 'URL', 'Domain', 'Hash', 'CVE', 'Email']
const CONF_LEVELS = ['All', 'Critical', 'High', 'Medium', 'Low']
const SOURCES = ['All', 'Feodo Tracker', 'URLhaus', 'ThreatFox', 'MalwareBazaar', 'CISA KEV', 'SSL Blacklist', 'Blocklist.de SSH', 'CINS Score']

export default function LiveFeed() {
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

  const prevTotalRef = useRef(0)
  const pollRef = useRef(null)

  const fetchIOCs = useCallback(async (p = page) => {
    try {
      setError(null)
      const data = await api.getIOCs({ type: typeFilter, confidence: confFilter, source: sourceFilter, page: p, limit: 50 })
      setIocs(prev => {
        // Highlight newly arrived IOCs
        const prevIds = new Set(prev.map(i => i.id))
        const fresh = new Set(data.iocs.filter(i => !prevIds.has(i.id)).map(i => i.id))
        if (fresh.size > 0) {
          setNewIds(fresh)
          setTimeout(() => setNewIds(new Set()), 4000)
        }
        return data.iocs
      })
      setTotal(data.total)
      setPages(data.pages)
      setLoading(false)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }, [typeFilter, confFilter, sourceFilter, page])

  // Initial + filter-change fetch
  useEffect(() => {
    setLoading(true)
    setPage(1)
    fetchIOCs(1)
  }, [typeFilter, confFilter, sourceFilter])

  // Poll every 10s
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
    a.download = `iocs_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Type pills */}
        <div style={{ display: 'flex', gap: 4 }}>
          {IOC_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid #0a1628',
              background: typeFilter === t ? '#0c1e36' : '#040c1a',
              color: typeFilter === t ? (TYPE_COLOR[t] || '#00ffa3') : '#334155',
              fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>

        {/* Confidence select */}
        <select value={confFilter} onChange={e => setConfFilter(e.target.value)}
          style={{ padding: '6px 10px', background: '#040c1a', border: '1px solid #0a1628', borderRadius: 6, color: '#475569', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
          {CONF_LEVELS.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Source select */}
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
          style={{ padding: '6px 10px', background: '#040c1a', border: '1px solid #0a1628', borderRadius: 6, color: '#475569', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
          {SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>

        {/* Spacer + stats + export */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, color: '#1e3a5f', fontFamily: 'monospace' }}>
            {total.toLocaleString()} indicators · page {page}/{pages}
          </span>
          <button onClick={() => fetchIOCs(page)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', background: '#040c1a', border: '1px solid #0a1628', borderRadius: 6, color: '#334155', fontSize: 10, cursor: 'pointer' }}>
            <div style={{ width: 12, height: 12 }}><Icons.RefreshCw /></div>
            Refresh
          </button>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', background: '#040c1a', border: '1px solid #0a1628', borderRadius: 6, color: '#334155', fontSize: 10, cursor: 'pointer' }}>
            <div style={{ width: 12, height: 12 }}><Icons.Download /></div>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#040c1a', border: '1px solid #0a1628', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '68px 1fr 90px 120px 130px 100px',
          padding: '9px 16px', borderBottom: '1px solid #0a1628',
          fontSize: 9, color: '#1e3a5f', letterSpacing: '0.13em',
        }}>
          <span>TYPE</span><span>INDICATOR</span><span>CONFIDENCE</span><span>MALWARE / THREAT</span><span>SOURCE</span><span>FIRST SEEN</span>
        </div>

        {/* Body */}
        {error ? (
          <div style={{ padding: 40, textAlign: 'center', fontSize: 12, color: '#ef4444' }}>
            ⚠ {error} — is the backend running?
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60, gap: 12 }}>
            <Spinner />
            <span style={{ fontSize: 12, color: '#1e3a5f' }}>Fetching live IOCs from threat feeds...</span>
          </div>
        ) : iocs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', fontSize: 12, color: '#1e3a5f' }}>
            No IOCs match current filters
          </div>
        ) : (
          <div style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
            {iocs.map(ioc => {
              const tc = TYPE_COLOR[ioc.type] || '#94a3b8'
              const cc = CONF_COLOR[ioc.confidence] || '#94a3b8'
              const isNew = newIds.has(ioc.id)
              return (
                <div
                  key={ioc.id}
                  onClick={() => setSelectedIOC(ioc)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '68px 1fr 90px 120px 130px 100px',
                    padding: '8px 16px',
                    borderBottom: '1px solid #03070e',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    background: isNew ? '#00ffa308' : 'transparent',
                    animation: isNew ? 'flashNew 4s ease' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0a1628'}
                  onMouseLeave={e => e.currentTarget.style.background = isNew ? '#00ffa308' : 'transparent'}
                >
                  <Badge label={ioc.type} color={tc} />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#4a6080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 16 }}>
                    {ioc.value}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: cc, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: cc, fontFamily: 'monospace' }}>{ioc.confidence}</span>
                  </div>
                  <span style={{ fontSize: 10, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ioc.malware || '—'}</span>
                  <span style={{ fontSize: 10, color: '#2a4060' }}>{ioc.source}</span>
                  <span style={{ fontSize: 9, color: '#1e3a5f', fontFamily: 'monospace' }}>{ioc.first_seen?.slice(0, 10) || '—'}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 14 }}>
          {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => { setPage(p); fetchIOCs(p) }} style={{
              width: 30, height: 30, borderRadius: 6,
              background: page === p ? '#0c1e36' : '#040c1a',
              border: '1px solid #0a1628',
              color: page === p ? '#00ffa3' : '#334155',
              fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
            }}>{p}</button>
          ))}
          {pages > 10 && <span style={{ fontSize: 10, color: '#1e3a5f', padding: '8px 4px' }}>…{pages}</span>}
        </div>
      )}

      {selectedIOC && <IOCModal ioc={selectedIOC} onClose={() => setSelectedIOC(null)} />}
    </div>
  )
}
