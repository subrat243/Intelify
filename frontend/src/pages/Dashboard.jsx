import { usePolling } from '../hooks/usePolling'
import { api } from '../utils/api'
import { Badge, Icons, SparkLine, AnimCounter, StatusDot, CONF_COLOR, TYPE_COLOR, useTheme, Spinner } from '../components/ui'

function DonutChart({ data, colors, theme }) {
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
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <svg viewBox="0 0 100 100" width={110} height={110} style={{ flexShrink: 0, filter: theme.isDark ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' : 'none' }}>
        <circle cx="50" cy="50" r="26" fill={theme.cardSolid} />
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.9} style={{ transition: 'all 0.3s' }} />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {slices.slice(0, 6).map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
      borderRadius: 16, 
      padding: '24px', 
      position: 'relative', 
      overflow: 'hidden',
      transition: 'transform 0.2s, border-color 0.2s',
      cursor: 'default',
      backdropFilter: 'blur(8px)'
    }} onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}66`; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateY(0)' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at 100% 0%, ${accent}${theme.isDark ? '10' : '08'} 0%, transparent 70%)` }} />
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

  const topSources = stats?.by_source ? Object.entries(stats.by_source).sort((a, b) => b[1] - a[1]).slice(0, 8) : []

  return (
    <div style={{ animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Total Ingestion */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28, backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Ingestion Velocity</div>
              <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 4 }}>Indicators sampled across all active feeds</div>
            </div>
            <Badge label="Real-time" color={theme.accent} variant="outline" />
          </div>
          <SparkLine data={stats?.ingestion_history ?? []} color={theme.accent} height={120} width={600} />
        </div>

        {/* IOC Type Distribution */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28, backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 24 }}>Indicator Distribution</div>
          <DonutChart data={stats?.by_type} colors={DONUT_COLORS} theme={theme} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Source breakdown */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28, backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20 }}>Intelligence Sources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topSources.map(([source, count], i) => {
              const max = topSources[0]?.[1] ?? 1
              return (
                <div key={source} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: theme.textSecondary, minWidth: 150 }}>{source}</span>
                  <div style={{ flex: 1, height: 6, background: theme.isDark ? theme.bg : theme.bgAlt, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: `linear-gradient(90deg, ${DONUT_COLORS[i % DONUT_COLORS.length]}dd, ${DONUT_COLORS[i % DONUT_COLORS.length]})`, borderRadius: 3, transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                  <span style={{ fontSize: 12, color: theme.text, fontWeight: 600, fontFamily: 'var(--font-mono)', minWidth: 50, textAlign: 'right' }}>{(count ?? 0).toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feed health summary */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28, backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20 }}>Infrastructure Radar</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(feeds ?? []).slice(0, 8).map(feed => (
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
