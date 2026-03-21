import { useState, useRef } from 'react'
import { api } from '../utils/api'
import { Badge, Icons, IOCModal, Spinner, useTheme, TYPE_COLOR, CONF_COLOR } from '../components/ui'

const EXAMPLES = ['emotet', 'cobalt strike', 'CVE-2023', 'trickbot', 'qakbot', 'ransomware', 'ssh', 'phishing']

export default function Search() {
  const { theme } = useTheme()
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
    <div style={{ animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)', maxWidth: 800, margin: '0 auto' }}>
      {/* Tab toggle */}
      <div style={{ 
        display: 'flex', gap: 4, marginBottom: 32, 
        background: theme.bgAlt, padding: 4, borderRadius: 14, 
        width: 'fit-content', border: `1px solid ${theme.border}`,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {[['single', 'Intelligence Search'], ['bulk', 'Bulk Correlation']].map(([mode, label]) => (
          <button key={mode} onClick={() => setActiveMode(mode)} style={{
            padding: '10px 24px', 
            background: activeMode === mode ? theme.cardSolid : 'transparent',
            border: 'none',
            borderRadius: 10,
            color: activeMode === mode ? theme.accent : theme.textMuted,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeMode === mode ? `0 4px 12px ${theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)'}` : 'none',
          }}>{label}</button>
        ))}
      </div>

      {/* Single search */}
      {activeMode === 'single' && (
        <>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, width: 22, height: 22 }}>
              <Icons.Search />
            </div>
            <input
              value={query}
              onChange={e => handleInput(e.target.value)}
              placeholder="Search indicators, malware families, or vulnerabilities..."
              style={{
                width: '100%', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16,
                padding: '18px 24px 18px 56px', color: theme.text, fontSize: 16, fontFamily: 'inherit',
                transition: 'all 0.2s', boxShadow: theme.isDark ? '0 8px 24px -12px rgba(0,0,0,0.5)' : '0 4px 12px -4px rgba(15,23,42,0.05)',
                outline: 'none', backdropFilter: 'blur(8px)'
              }}
              onFocus={e => { e.target.style.borderColor = theme.primary + '66'; e.target.style.boxShadow = `0 0 0 4px ${theme.primary}11` }}
              onBlur={e => { e.target.style.borderColor = theme.border; e.target.style.boxShadow = theme.isDark ? '0 8px 24px -12px rgba(0,0,0,0.5)' : '0 4px 12px -4px rgba(15,23,42,0.05)' }}
            />
            {loading && (
              <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)' }}>
                <Spinner size={20} />
              </div>
            )}
          </div>

          {/* Chips */}
          {!query && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', marginRight: 6 }}>Popular Queries:</span>
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => handleInput(ex)} style={{
                  padding: '6px 14px', background: theme.bgAlt, border: `1px solid ${theme.border}`,
                  borderRadius: 20, color: theme.textSecondary, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }} onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}>{ex}</button>
              ))}
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Identification found <b>{results.total}</b> matching records</span>
                <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: 'var(--font-mono)' }}>Search: "{results.query}"</span>
              </div>
              
              {results.results.length === 0 ? (
                <div style={{ padding: 80, textAlign: 'center', background: theme.bgAlt, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }}>🔍</div>
                  <div style={{ fontSize: 14, color: theme.textMuted, fontWeight: 500 }}>No intelligence correlates with this query.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.results.map(ioc => {
                    const tc = TYPE_COLOR(theme)[ioc.type] || theme.textMuted
                    const cc = CONF_COLOR(theme)[ioc.confidence] || theme.textMuted
                    return (
                      <div
                        key={ioc.id}
                        onClick={() => setSelectedIOC(ioc)}
                        style={{ 
                          display: 'flex', gap: 16, alignItems: 'center', padding: '14px 20px', 
                          background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, 
                          cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(8px)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = theme.cardHover; e.currentTarget.style.borderColor = `${cc}44` }}
                        onMouseLeave={e => { e.currentTarget.style.background = theme.card; e.currentTarget.style.borderColor = theme.border }}
                      >
                        <Badge label={ioc.type} color={tc} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: theme.textSecondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ioc.value}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 100 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cc }} />
                          <span style={{ fontSize: 12, color: cc, fontWeight: 700 }}>{ioc.confidence}</span>
                        </div>
                        <span style={{ fontSize: 12, color: theme.textMuted, minWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ioc.malware || '—'}</span>
                        <span style={{ fontSize: 11, color: theme.textMuted, minWidth: 100, textAlign: 'right' }}>{ioc.source}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {!query && !results && (
            <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 32 }}>
                <div style={{ width: 40, height: 40, color: theme.primary }}><Icons.Shield /></div>
                <div style={{ width: 40, height: 40, color: theme.accent }}><Icons.Activity /></div>
                <div style={{ width: 40, height: 40, color: theme.secondary }}><Icons.Database /></div>
              </div>
              <div style={{ fontSize: 16, color: theme.textSecondary, fontWeight: 500 }}>Global OSINT Registry Explorer</div>
              <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 8 }}>Cross-reference indicators across all platform-integrated feeds</div>
            </div>
          )}
        </>
      )}

      {/* Bulk lookup */}
      {activeMode === 'bulk' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.textSecondary }}>Indicator Matrix</h3>
              <Badge label="CORRELATION MODE" color={theme.secondary} variant="solid" />
            </div>
            <p style={{ fontSize: 13, color: theme.textMuted }}>Input multiple indicators (one per line, max 50) for cross-registry analysis.</p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <textarea
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              placeholder={'192.168.1.1\ncve-2023-1234\nevil-domain.ru\nd8e8f8...'}
              rows={10}
              style={{ 
                width: '100%', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, 
                padding: '24px', color: theme.text, fontSize: 14, fontFamily: "var(--font-mono)", 
                resize: 'none', lineHeight: 1.7, transition: 'all 0.3s ease', outline: 'none',
                backdropFilter: 'blur(12px)',
                boxShadow: theme.isDark ? 'inset 0 2px 8px rgba(0,0,0,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
              onFocus={e => {
                e.target.style.borderColor = theme.secondary + '88';
                e.target.style.boxShadow = `0 0 0 4px ${theme.secondary}15, inset 0 2px 8px rgba(0,0,0,0.1)`;
              }}
              onBlur={e => {
                e.target.style.borderColor = theme.border;
                e.target.style.boxShadow = theme.isDark ? 'inset 0 2px 8px rgba(0,0,0,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.02)';
              }}
            />
          </div>

          <button
            onClick={doBulkLookup}
            disabled={bulkLoading || !bulkInput.trim()}
            style={{ 
              marginTop: 24, padding: '16px 40px', 
              background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`, 
              border: 'none', borderRadius: 16, 
              color: theme.isDark ? theme.bg : '#fff', 
              fontSize: 15, fontWeight: 800, letterSpacing: '0.02em',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, 
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: `0 12px 24px -8px ${theme.secondary}66`,
              opacity: bulkLoading || !bulkInput.trim() ? 0.5 : 1,
              width: 'fit-content'
            }}
            onMouseEnter={e => { 
              if (!bulkLoading && bulkInput.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 16px 32px -8px ${theme.secondary}88`;
              }
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = `0 12px 24px -8px ${theme.secondary}66`;
            }}
          >
            <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {bulkLoading ? <Spinner size={18} color={theme.bg} /> : <Icons.Activity />}
            </div>
            <span>{bulkLoading ? 'ANALYZING MATRIX...' : 'ANALYZE INDICATORS'}</span>
          </button>

          {bulkResults && (
            <div style={{ marginTop: 40 }}>
              <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 20, fontWeight: 600 }}>
                ANALYSIS COMPLETE: {bulkResults.queried} RECORDS PROCESSED
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(bulkResults.results).map(([val, hits]) => (
                  <div key={val} style={{ background: theme.card, border: `1px solid ${hits.length > 0 ? theme.danger + '22' : theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 16, background: hits.length > 0 ? theme.danger + '05' : 'transparent' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: hits.length > 0 ? theme.danger : theme.textSecondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                      <Badge label={hits.length > 0 ? `${hits.length} HIT${hits.length > 1 ? 'S' : ''}` : 'NO MATCH'} color={hits.length > 0 ? theme.danger : theme.success} />
                    </div>
                    {hits.length > 0 && (
                      <div style={{ padding: '8px 12px' }}>
                        {hits.map(ioc => (
                          <div key={ioc.id} onClick={() => setSelectedIOC(ioc)}
                            style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = theme.bgAlt}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Badge label={ioc.type} color={TYPE_COLOR(theme)[ioc.type] || theme.textMuted} />
                            <span style={{ fontSize: 12, color: theme.textSecondary, flex: 1 }}>{ioc.malware || ioc.source}</span>
                            <Badge label={ioc.confidence} color={CONF_COLOR(theme)[ioc.confidence] || theme.textMuted} variant="outline" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedIOC && <IOCModal ioc={selectedIOC} onClose={() => setSelectedIOC(null)} />}
    </div>
  )
}
