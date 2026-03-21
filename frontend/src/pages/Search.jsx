import { useState, useRef } from 'react'
import { api } from '../utils/api'
import { Badge, Icons, IOCModal, Spinner, CONF_COLOR, TYPE_COLOR } from '../components/ui'

const EXAMPLES = ['emotet', 'cobalt strike', 'CVE-2023', 'trickbot', 'qakbot', 'ransomware', 'ssh', 'phishing']

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedIOC, setSelectedIOC] = useState(null)
  // Bulk lookup state
  const [bulkInput, setBulkInput] = useState('')
  const [bulkResults, setBulkResults] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [activeMode, setActiveMode] = useState('single') // 'single' | 'bulk'
  const debounceRef = useRef(null)

  const doSearch = async (q) => {
    if (!q || q.trim().length < 2) { setResults(null); return }
    setLoading(true); setError(null)
    try {
      const data = await api.search(q.trim(), 100)
      setResults(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (val) => {
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 400)
  }

  const doBulkLookup = async () => {
    const values = bulkInput.split('\n').map(v => v.trim()).filter(Boolean)
    if (!values.length) return
    setBulkLoading(true); setBulkResults(null)
    try {
      const data = await api.lookupIOCs(values)
      setBulkResults(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 860, margin: '0 auto' }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {[['single', 'Single Search'], ['bulk', 'Bulk Lookup']].map(([mode, label]) => (
          <button key={mode} onClick={() => setActiveMode(mode)} style={{
            padding: '8px 20px', background: activeMode === mode ? '#0c1e36' : '#040c1a',
            border: '1px solid #0a1628', borderRadius: 7,
            color: activeMode === mode ? '#00ffa3' : '#334155',
            fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      {/* Single search */}
      {activeMode === 'single' && (
        <>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#1e3a5f', width: 18, height: 18 }}>
              <Icons.Search />
            </div>
            <input
              value={query}
              onChange={e => handleInput(e.target.value)}
              placeholder="Search IOCs — IP, domain, hash, malware family, CVE…"
              style={{
                width: '100%', background: '#040c1a', border: '1px solid #0c1e36', borderRadius: 10,
                padding: '14px 16px 14px 44px', color: '#c9d4e8', fontSize: 14, fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#1e3a5f'}
              onBlur={e => e.target.style.borderColor = '#0c1e36'}
            />
            {loading && (
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                <Spinner size={16} />
              </div>
            )}
          </div>

          {/* Example chips */}
          {!query && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              <span style={{ fontSize: 10, color: '#1e3a5f', marginRight: 4 }}>Try:</span>
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => handleInput(ex)} style={{
                  padding: '4px 10px', background: '#040c1a', border: '1px solid #0a1628',
                  borderRadius: 20, color: '#334155', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
                }}>{ex}</button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 12 }}>⚠ {error}</div>}

          {/* Results */}
          {results && !loading && (
            <div>
              <div style={{ fontSize: 10, color: '#1e3a5f', marginBottom: 10, fontFamily: 'monospace' }}>
                {results.total} result{results.total !== 1 ? 's' : ''} for <span style={{ color: '#475569' }}>"{results.query}"</span>
              </div>
              {results.results.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#1e3a5f', fontSize: 12 }}>
                  No threat intelligence found for this query.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {results.results.map(ioc => {
                    const tc = TYPE_COLOR[ioc.type] || '#94a3b8'
                    const cc = CONF_COLOR[ioc.confidence] || '#94a3b8'
                    return (
                      <div
                        key={ioc.id}
                        onClick={() => setSelectedIOC(ioc)}
                        style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '11px 14px', background: '#040c1a', border: '1px solid #08121e', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0a1628'}
                        onMouseLeave={e => e.currentTarget.style.background = '#040c1a'}
                      >
                        <Badge label={ioc.type} color={tc} />
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a6080', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ioc.value}</span>
                        <Badge label={ioc.confidence} color={cc} />
                        <span style={{ fontSize: 10, color: '#334155', minWidth: 120 }}>{ioc.malware || '—'}</span>
                        <span style={{ fontSize: 9, color: '#1e3a5f', minWidth: 110, textAlign: 'right' }}>{ioc.source}</span>
                      </div>
                    )
                  })}
                  {results.total > results.results.length && (
                    <div style={{ fontSize: 10, color: '#1e3a5f', textAlign: 'center', padding: 12 }}>
                      Showing {results.results.length} of {results.total} — refine query for more specific results
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!query && !results && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.3 }}>🔍</div>
              <div style={{ fontSize: 12, color: '#1e3a5f' }}>Search across all live threat intelligence feeds</div>
            </div>
          )}
        </>
      )}

      {/* Bulk lookup */}
      {activeMode === 'bulk' && (
        <div>
          <div style={{ fontSize: 11, color: '#334155', marginBottom: 12 }}>
            Paste up to 50 indicators (one per line) — IPs, domains, hashes, CVEs
          </div>
          <textarea
            value={bulkInput}
            onChange={e => setBulkInput(e.target.value)}
            placeholder={'192.168.1.1\nevil-domain.ru\nCVE-2023-44487\nabc123def456...'}
            rows={8}
            style={{ width: '100%', background: '#040c1a', border: '1px solid #0c1e36', borderRadius: 10, padding: '14px', color: '#c9d4e8', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", resize: 'vertical', lineHeight: 1.7 }}
          />
          <button
            onClick={doBulkLookup}
            disabled={bulkLoading || !bulkInput.trim()}
            style={{ marginTop: 10, padding: '10px 24px', background: '#0c1e36', border: '1px solid #1e3a5f', borderRadius: 8, color: '#00ffa3', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {bulkLoading ? <><Spinner size={14} /> Looking up...</> : 'Lookup Indicators →'}
          </button>

          {bulkResults && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 10, color: '#1e3a5f', marginBottom: 12, fontFamily: 'monospace' }}>
                Queried {bulkResults.queried} indicator{bulkResults.queried !== 1 ? 's' : ''}
              </div>
              {Object.entries(bulkResults.results).map(([val, hits]) => (
                <div key={val} style={{ marginBottom: 12, background: '#040c1a', border: '1px solid #08121e', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #08121e', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#7a93b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                    <Badge label={hits.length > 0 ? `${hits.length} hit${hits.length > 1 ? 's' : ''}` : 'clean'} color={hits.length > 0 ? '#ef4444' : '#00ffa3'} />
                  </div>
                  {hits.map(ioc => (
                    <div key={ioc.id} onClick={() => setSelectedIOC(ioc)}
                      style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 14px', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0a1628'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Badge label={ioc.type} color={TYPE_COLOR[ioc.type] || '#94a3b8'} />
                      <span style={{ fontSize: 10, color: '#475569', flex: 1 }}>{ioc.malware || ioc.source}</span>
                      <Badge label={ioc.confidence} color={CONF_COLOR[ioc.confidence] || '#94a3b8'} />
                      <span style={{ fontSize: 9, color: '#1e3a5f' }}>{ioc.source}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedIOC && <IOCModal ioc={selectedIOC} onClose={() => setSelectedIOC(null)} />}
    </div>
  )
}
