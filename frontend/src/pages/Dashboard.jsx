import { useState } from 'react'
import { usePolling } from '../hooks/usePolling'
import { api } from '../utils/api'
import { Badge, Icons, SparkLine, AnimCounter, StatusDot, CONF_COLOR, TYPE_COLOR, useTheme, Spinner } from '../components/ui'

function DonutChart({ data, colors, theme }) {
  const [activeIndex, setActiveIndex] = useState(null)
  if (!data || Object.keys(data).length === 0) return null
  const entries = Object.entries(data).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((a, [, v]) => a + v, 0)
  if (total === 0) return null

  let cumulative = 0
  const slices = entries.map(([key, val], i) => {
    const pct = val / total
    const start = cumulative
    cumulative += pct
    const startAngle = start * 2 * Math.PI - Math.PI / 2
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2
    const r = 38, cx = 50, cy = 50
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle)
    const large = pct > 0.5 ? 1 : 0
    return { key, val, pct, color: colors[i % colors.length], path: `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}Z` }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center', justifyContent: 'space-between', flex: 1, minHeight: 340, paddingTop: 8 }}>
      <svg viewBox="0 0 100 100" width={400} height={400} style={{ flexShrink: 0, maxWidth: '100%', height: 'auto' }}>
        <circle cx="50" cy="50" r="26" fill={theme.cardSolid} />
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            opacity={activeIndex === null || activeIndex === i ? 1 : 0.72}
            stroke={activeIndex === i ? theme.cardSolid : 'none'}
            strokeWidth={activeIndex === i ? 1.5 : 0}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            style={{ cursor: 'pointer', outline: 'none', transition: 'opacity 0.2s, stroke-width 0.2s' }}
          >
            <title>{`${s.key}: ${s.val.toLocaleString()} indicators (${(s.pct * 100).toFixed(0)}%)`}</title>
          </path>
        ))}
      </svg>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px 28px' }}>
        {slices.slice(0, 6).map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px', borderRadius: 5, background: activeIndex === i ? theme.navActive : 'transparent', transition: 'background 0.2s' }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: theme.textSecondary, flex: 1 }}>{s.key}</span>
            <span style={{ fontSize: 12, color: theme.text, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{(s.val ?? 0).toLocaleString()}</span>
            <span style={{ fontSize: 10, color: theme.textMuted, fontFamily: 'var(--font-mono)', minWidth: 40, textAlign: 'right' }}>{(s.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, accent, spark, theme }) {
  return (
    <div style={{ 
      background: theme.card, 
      border: `1px solid ${theme.border}`, 
      borderRadius: 12,
      padding: '20px',
      minHeight: 148,
      position: 'relative', 
      overflow: 'hidden',
      transition: 'transform 0.2s, border-color 0.2s',
      cursor: 'default',
      boxShadow: '0 6px 18px rgba(32,44,70,0.04)'
    }} onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}66`; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateY(0)' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at 100% 0%, ${accent}08 0%, transparent 70%)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ color: accent, width: 20, height: 20, opacity: 0.8 }}><Icon /></div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: theme.text, fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}>
        {typeof value === 'number' ? <AnimCounter target={value} /> : value}
      </div>
      {sub && <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>{sub}</div>}
      {spark && (
        <div style={{ marginTop: 16, opacity: 0.8 }}>
          <SparkLine data={spark} color={accent} height={32} width={180} />
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { theme } = useTheme()
  const { data: stats, loading, error, refetch } = usePolling(api.getStats, 15000)
  const { data: feeds } = usePolling(api.getFeeds, 15000)

  const DONUT_COLORS = [theme.accent, '#f97316', '#818cf8', '#fbbf24', theme.danger, '#60a5fa', '#f472b6', theme.success]

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 16 }}>
      <Spinner size={32} />
      <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500 }}>Initializing intelligence matrix...</span>
    </div>
  )

  if (error) return (
    <div style={{ padding: 60, textAlign: 'center', background: theme.card, borderRadius: 16, border: `1px solid ${theme.danger}22` }}>
      <div style={{ fontSize: 14, color: theme.danger, marginBottom: 16, fontWeight: 600 }}>⚠ NETWORK ADVERSITY DETECTED</div>
      <div style={{ fontSize: 11, color: theme.textMuted, fontFamily: 'var(--font-mono)', marginBottom: 24 }}>{error}</div>
      <button onClick={refetch} style={{ padding: '10px 24px', background: `${theme.danger}11`, border: `1px solid ${theme.danger}33`, borderRadius: 8, color: theme.danger, fontSize: 12, fontWeight: 600 }}>RETRY CONNECTION</button>
    </div>
  )

  const sourceCounts = feeds?.length
    ? Object.fromEntries(feeds.map(feed => [feed.name, feed.ioc_count ?? 0]))
    : (stats?.by_source ?? {})
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const latestIngestion = stats?.ingestion_history?.at(-1) ?? 0
  const lastUpdated = stats?.last_updated ? new Date(stats.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Waiting'

  return (
    <div style={{ animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 22, color: theme.text, fontWeight: 700, letterSpacing: '-0.02em' }}>Intelligence overview</div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 5 }}>Live visibility across your connected threat intelligence sources.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.textMuted, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <StatusDot status="ok" /> Updated {lastUpdated}
        </div>
      </div>
      {/* Stat cards */}
      <div className="dashboard-stat-grid" style={{ display: 'grid', gap: 20, marginBottom: 24 }}>
        <StatCard
          theme={theme}
          label="Total Indicators" value={stats?.total ?? 0}
          sub={<><StatusDot status="ok" /> {stats?.feeds_online ?? 0} active sources</>}
          icon={Icons.Shield} accent={theme.primary} spark={stats?.ingestion_history}
        />
        <StatCard
          theme={theme}
          label="Critical Threats" value={stats?.critical ?? 0}
          sub="Immediate mitigation required"
          icon={Icons.AlertTriangle} accent={theme.danger}
        />
        <StatCard
          theme={theme}
          label="High Severity" value={stats?.high ?? 0}
          sub="Priority investigation"
          icon={Icons.Zap} accent={theme.warning}
        />
        <StatCard
          theme={theme}
          label="Network Health" value={`${stats?.feeds_online ?? 0}/${stats?.feeds_total ?? 0}`}
          sub={stats?.last_updated ? `Sync: ${new Date(stats.last_updated).toLocaleTimeString()}` : ''}
          icon={Icons.Database} accent={theme.accent}
        />
      </div>

      <div className="dashboard-chart-grid" style={{ display: 'grid', gap: 20, marginBottom: 24 }}>
        {/* Total Ingestion */}
        <div style={{ display: 'flex', flexDirection: 'column', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24, boxShadow: '0 6px 18px rgba(32,44,70,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: theme.text, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Ingestion activity</div>
              <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>Current retained indicators: <strong style={{ color: theme.text }}>{latestIngestion.toLocaleString()}</strong></div>
            </div>
            <Badge label="Real-time" color={theme.accent} variant="outline" />
          </div>
          <div style={{ minHeight: 120, display: 'flex', alignItems: 'end', overflow: 'hidden' }}>
            <SparkLine data={stats?.ingestion_history ?? []} color={theme.accent} height={120} width={600} />
          </div>
        </div>

        {/* Source breakdown */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24, boxShadow: '0 6px 18px rgba(32,44,70,0.04)' }}>
          <div style={{ fontSize: 12, color: theme.text, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Intelligence sources</div>
          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 20 }}>Current records reported by each feed.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topSources.map(([source, count], i) => {
              const max = topSources[0]?.[1] ?? 1
              return (
                <div key={source} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: theme.textSecondary, minWidth: 150 }}>{source}</span>
                  <div style={{ flex: 1, height: 6, background: theme.bgAlt, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: `linear-gradient(90deg, ${DONUT_COLORS[i % DONUT_COLORS.length]}dd, ${DONUT_COLORS[i % DONUT_COLORS.length]})`, borderRadius: 3, transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                  <span style={{ fontSize: 12, color: theme.text, fontWeight: 600, fontFamily: 'var(--font-mono)', minWidth: 50, textAlign: 'right' }}>{(count ?? 0).toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="dashboard-detail-grid" style={{ display: 'grid', gap: 20 }}>
        {/* IOC Type Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24, boxShadow: '0 6px 18px rgba(32,44,70,0.04)' }}>
          <div style={{ fontSize: 12, color: theme.text, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 24 }}>Indicator distribution</div>
          <DonutChart data={stats?.by_type} colors={DONUT_COLORS} theme={theme} />
        </div>

        {/* Feed health summary */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24, boxShadow: '0 6px 18px rgba(32,44,70,0.04)' }}>
          <div style={{ fontSize: 12, color: theme.text, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Infrastructure health</div>
          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 20 }}>Connection status across all configured sources.</div>
          <div className="dashboard-feed-grid" style={{ display: 'grid', gap: 10 }}>
            {(feeds ?? []).map(feed => (
              <div key={feed.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: `${theme.bg}66`, borderRadius: 12, border: `1px solid ${theme.borderLight}` }}>
                <StatusDot status={feed.status} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: theme.text, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feed.name}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted, fontFamily: 'var(--font-mono)' }}>{(feed.ioc_count ?? 0).toLocaleString()} indicators</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
