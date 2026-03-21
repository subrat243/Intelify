// ── Constants ─────────────────────────────────────────────────────────────────
export const CONF_COLOR = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#fbbf24',
  Low: '#5eead4',
}

export const TYPE_COLOR = {
  IP: '#ef4444',
  URL: '#f97316',
  Domain: '#a78bfa',
  Hash: '#fbbf24',
  CVE: '#00ffa3',
  Email: '#60a5fa',
}

export const FEED_COLOR = {
  feodo: '#ef4444',
  urlhaus: '#f97316',
  threatfox: '#a78bfa',
  bazaar: '#fbbf24',
  cisa_kev: '#00ffa3',
  sslbl: '#60a5fa',
  blocklistde_ssh: '#f472b6',
  cinsscore: '#34d399',
}

// ── Icons ─────────────────────────────────────────────────────────────────────
export const Icons = {
  Shield:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Search:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Activity:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Database:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  RefreshCw:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  X:            () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Copy:         () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Download:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  AlertTriangle:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Zap:          () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  ExternalLink: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.09em',
      padding: '2px 7px', borderRadius: 3,
      background: `${color}18`, color, border: `1px solid ${color}38`,
      fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {String(label || '').toUpperCase()}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = '#00ffa3' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${color}22`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ── Status dot ────────────────────────────────────────────────────────────────
export function StatusDot({ status }) {
  const colors = { ok: '#00ffa3', loading: '#fbbf24', error: '#ef4444', pending: '#334155' }
  const c = colors[status] || '#334155'
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'block', boxShadow: status === 'ok' ? `0 0 6px ${c}` : 'none' }} />
      {status === 'loading' && (
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${c}`, animation: 'ping 1.2s infinite' }} />
      )}
    </span>
  )
}

// ── SparkLine ─────────────────────────────────────────────────────────────────
export function SparkLine({ data, color = '#00ffa3', height = 32, width = 120 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * (height - 4) - 2}`)
    .join(' ')
  const id = `sg${color.replace('#', '')}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`${pts} ${width},${height} 0,${height}`} fill={`url(#${id})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── AnimCounter ───────────────────────────────────────────────────────────────
export function AnimCounter({ target, duration = 900 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <>{val.toLocaleString()}</>
}

// ── IOC Detail Modal ──────────────────────────────────────────────────────────
export function IOCModal({ ioc, onClose }) {
  const [copied, setCopied] = useState(false)
  if (!ioc) return null
  const cc = CONF_COLOR[ioc.confidence] || '#94a3b8'
  const tc = TYPE_COLOR[ioc.type] || '#94a3b8'

  const copy = () => {
    navigator.clipboard.writeText(ioc.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const rows = [
    ioc.malware && ['Malware / Threat', ioc.malware],
    ioc.source && ['Source Feed', ioc.source],
    ioc.first_seen && ['First Seen', ioc.first_seen],
    ioc.last_seen && ['Last Seen', ioc.last_seen],
    ioc.port && ['Port', ioc.port],
    ioc.file_type && ['File Type', ioc.file_type],
    ioc.status && ['Status', ioc.status],
    ioc.due_date && ['CISA Due Date', ioc.due_date],
    ioc.score !== undefined && ['Threat Score', `${ioc.score}/100`],
  ].filter(Boolean)

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,15,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#080f1e', border: `1px solid ${cc}28`, borderRadius: 14, width: '100%', maxWidth: 540, padding: 28, position: 'relative', boxShadow: `0 0 60px ${cc}12, 0 40px 80px rgba(0,0,0,0.95)`, animation: 'slideUp 0.2s ease' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: '#334155', cursor: 'pointer', width: 20, height: 20 }}>
          <Icons.X />
        </button>

        <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap' }}>
          <Badge label={ioc.type} color={tc} />
          <Badge label={ioc.confidence} color={cc} />
          <Badge label={ioc.source} color="#475569" />
        </div>

        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0', wordBreak: 'break-all', background: '#03080f', padding: '12px 44px 12px 14px', borderRadius: 8, border: `1px solid ${cc}20`, lineHeight: 1.7 }}>
            {ioc.value}
          </div>
          <button onClick={copy} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: copied ? '#00ffa3' : '#334155', cursor: 'pointer', width: 18, height: 18 }}>
            <Icons.Copy />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#03080f', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ padding: '9px 13px', background: '#080f1e' }}>
              <div style={{ fontSize: 9, color: '#1e3a5f', letterSpacing: '0.12em', marginBottom: 3 }}>{k.toUpperCase()}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{v}</div>
            </div>
          ))}
        </div>

        {ioc.description && (
          <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.6, padding: '10px 13px', background: '#03080f', borderRadius: 8, marginBottom: 14, border: '1px solid #0c1828' }}>
            {ioc.description}
          </div>
        )}

        {ioc.tags?.filter(Boolean).length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ioc.tags.filter(Boolean).slice(0, 6).map(t => (
              <Badge key={t} label={t} color="#6366f1" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// need useState, useEffect imported in this file
import { useState, useEffect } from 'react'
