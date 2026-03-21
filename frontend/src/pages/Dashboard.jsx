import { useState } from 'react'
import { usePolling } from '../hooks/usePolling'
import { api } from '../utils/api'
import { Badge, Icons, SparkLine, AnimCounter, StatusDot, CONF_COLOR, TYPE_COLOR } from '../components/ui'

const DONUT_COLORS = ['#00ffa3', '#f97316', '#a78bfa', '#fbbf24', '#ef4444', '#60a5fa', '#f472b6', '#34d399']

function DonutChart({ data, colors }) {
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
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <svg viewBox="0 0 100 100" width={110} height={110} style={{ flexShrink: 0 }}>
        <circle cx="50" cy="50" r="26" fill="#02060f" />
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.88} />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#64748b', minWidth: 60 }}>{s.key}</span>
            <span style={{ fontSize: 11, color: s.color, fontFamily: 'monospace' }}>{s.val.toLocaleString()}</span>
            <span style={{ fontSize: 9, color: '#1e3a5f', fontFamily: 'monospace' }}>{(s.pct * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, accent, spark }) {
  return (
    <div style={{ background: '#040c1a', border: `1px solid ${accent}20`, borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 100% 0%, ${accent}12 0%, transparent 70%)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 9, color: '#1e3a5f', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ color: accent, width: 17, height: 17, opacity: 0.7 }}><Icon /></div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '-0.02em' }}>
        {typeof value === 'number' ? <AnimCounter target={value} /> : value}
      </div>
      {sub && <div style={{ fontSize: 10, color: accent, marginTop: 4, opacity: 0.8 }}>{sub}</div>}
      {spark && (
        <div style={{ marginTop: 8 }}>
          <SparkLine data={spark} color={accent} height={28} width={140} />
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { data: stats, loading, error, refetch } = usePolling(api.getStats, 15000)
  const { data: feeds } = usePolling(api.getFeeds, 15000)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, gap: 12, color: '#1e3a5f', fontSize: 12 }}>
      <div style={{ width: 22, height: 22, border: '2px solid #0c1e36', borderTopColor: '#00ffa3', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading threat intelligence...
    </div>
  )

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>⚠ Cannot reach backend — is the API server running?</div>
      <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', marginBottom: 16 }}>{error}</div>
      <button onClick={refetch} style={{ padding: '8px 20px', background: '#040c1a', border: '1px solid #1e3a5f', borderRadius: 7, color: '#64748b', fontSize: 11, cursor: 'pointer' }}>Retry</button>
    </div>
  )

  const totalActors = stats?.by_source ? Object.entries(stats.by_source).sort((a, b) => b[1] - a[1]) : []

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard
          label="Total IOCs" value={stats?.total ?? 0}
          sub={`${stats?.feeds_online ?? 0}/${stats?.feeds_total ?? 0} feeds online`}
          icon={Icons.Shield} accent="#00ffa3" spark={stats?.ingestion_history}
        />
        <StatCard
          label="Critical IOCs" value={stats?.critical ?? 0}
          sub="Immediate action required"
          icon={Icons.AlertTriangle} accent="#ef4444"
        />
        <StatCard
          label="High Severity" value={stats?.high ?? 0}
          sub="Investigate promptly"
          icon={Icons.Zap} accent="#f97316"
        />
        <StatCard
          label="Feeds Online" value={`${stats?.feeds_online ?? 0}/${stats?.feeds_total ?? 0}`}
          sub={stats?.last_updated ? `Updated ${new Date(stats.last_updated).toLocaleTimeString()}` : ''}
          icon={Icons.Database} accent="#60a5fa"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* IOC Type Distribution */}
        <div style={{ background: '#040c1a', border: '1px solid #0a1628', borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 10, color: '#1e3a5f', letterSpacing: '0.14em', marginBottom: 18 }}>IOC TYPE DISTRIBUTION</div>
          <DonutChart data={stats?.by_type} colors={DONUT_COLORS} />
        </div>

        {/* Ingestion timeline */}
        <div style={{ background: '#040c1a', border: '1px solid #0a1628', borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 10, color: '#1e3a5f', letterSpacing: '0.14em', marginBottom: 6 }}>TOTAL IOC COUNT — ROLLING HISTORY</div>
          <div style={{ fontSize: 9, color: '#0c1e36', marginBottom: 16 }}>Sampled every 15s since startup</div>
          <SparkLine data={stats?.ingestion_history ?? []} color="#00ffa3" height={80} width={320} />
        </div>
      </div>

      {/* Source breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* By source */}
        <div style={{ background: '#040c1a', border: '1px solid #0a1628', borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 10, color: '#1e3a5f', letterSpacing: '0.14em', marginBottom: 16 }}>IOCs BY SOURCE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {totalActors.map(([source, count], i) => {
              const max = totalActors[0]?.[1] ?? 1
              return (
                <div key={source} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 10, color: '#334155', minWidth: 14, textAlign: 'right', fontFamily: 'monospace' }}>{i + 1}</span>
                  <span style={{ fontSize: 11, color: '#64748b', minWidth: 140 }}>{source}</span>
                  <div style={{ flex: 1, height: 5, background: '#0a1628', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: DONUT_COLORS[i % DONUT_COLORS.length], borderRadius: 3, transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', minWidth: 40, textAlign: 'right' }}>{count.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feed health */}
        <div style={{ background: '#040c1a', border: '1px solid #0a1628', borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 10, color: '#1e3a5f', letterSpacing: '0.14em', marginBottom: 16 }}>FEED HEALTH</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(feeds ?? []).map(feed => (
              <div key={feed.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusDot status={feed.status} />
                <span style={{ fontSize: 11, color: '#64748b', flex: 1 }}>{feed.name}</span>
                <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>
                  {feed.ioc_count > 0 ? feed.ioc_count.toLocaleString() : '—'}
                </span>
                <Badge
                  label={feed.status}
                  color={feed.status === 'ok' ? '#00ffa3' : feed.status === 'loading' ? '#fbbf24' : feed.status === 'error' ? '#ef4444' : '#334155'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
