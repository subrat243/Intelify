import { useState, useEffect, useRef, createContext, useContext } from 'react'

// ── Theme Management ──────────────────────────────────────────────────────────
export const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const THEMES = {
  light: {
    bg: '#eef3f6',
    bgAlt: '#e5edf1',
    card: '#ffffff',
    cardSolid: '#ffffff',
    cardHover: '#f4f8fa',
    border: '#ccd8df',
    borderLight: '#e1e9ed',
    text: '#202c46',
    textSecondary: '#52627a',
    textMuted: '#8190a3',
    primary: '#202c46',
    secondary: '#60758c',
    accent: '#2db8b0',
    danger: '#ef4444',
    warning: '#d38a26',
    success: '#20a78d',
    navActive: '#dce8ed',
    navHover: '#e6eef2'
  }
}

// Global reference for static styles if needed, but components should use useTheme()
export const COLORS = THEMES.light

export const CONF_COLOR = (t) => ({
  Critical: t.danger,
  High: '#f97316',
  Medium: t.warning,
  Low: '#14b8a6',
})

export const TYPE_COLOR = (t) => ({
  IP: t.danger,
  URL: '#f97316',
  Domain: '#6366f1',
  Hash: t.warning,
  CVE: t.accent,
  Email: '#0ea5e9',
})

export function GlyphMatrix({ glyphs = '01.+*/\\<>=' , cellSize = 14, mutationRate = 0.04, interval = 90, fadeBottom = 0.6, color = '#6B7280' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined
    let frame = null
    let columns = 0
    let rows = 0
    let cells = []

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(bounds.width * ratio))
      canvas.height = Math.max(1, Math.floor(bounds.height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      columns = Math.ceil(bounds.width / cellSize)
      rows = Math.ceil(bounds.height / cellSize)
      cells = Array.from({ length: columns * rows }, () => Math.random())
    }

    const draw = () => {
      const bounds = canvas.getBoundingClientRect()
      context.clearRect(0, 0, bounds.width, bounds.height)
        context.font = `${cellSize}px "IBM Plex Mono", monospace`
      context.textBaseline = 'top'
      for (let row = 0; row < rows; row += 1) {
        const fade = 1 - (row / Math.max(rows - 1, 1)) * fadeBottom
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column
          if (Math.random() < mutationRate) cells[index] = Math.random()
          const opacity = (0.3 + cells[index] * 0.7) * fade
          const glyph = glyphs[Math.floor(cells[index] * glyphs.length)] || glyphs[0]
          context.fillStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
          context.fillText(glyph, column * cellSize, row * cellSize)
        }
      }
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const timer = window.setInterval(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(draw)
    }, interval)
    draw()

    return () => {
      observer.disconnect()
      window.clearInterval(timer)
      cancelAnimationFrame(frame)
    }
  }, [cellSize, color, fadeBottom, glyphs, interval, mutationRate])

  return <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />
}

// ── Icons ─────────────────────────────────────────────────────────────────────
export const Icons = {
  Shield:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Search:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Activity:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Database:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  RefreshCw:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  X:            () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Copy:         () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Download:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  AlertTriangle:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Zap:          () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  ExternalLink: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  ChevronDown:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color, variant = 'subtle' }) {
  const isOutline = variant === 'outline'
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
      padding: '2px 8px', borderRadius: 4,
      background: isOutline ? 'transparent' : `${color}14`,
      color,
      border: `1px solid ${color}${isOutline ? '44' : '22'}`,
      fontFamily: "var(--font-mono)", whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 4
    }}>
      {String(label || '').toUpperCase()}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color }) {
  const { theme } = useTheme()
  const c = color || theme.accent
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${c}11`,
      borderTopColor: c,
      borderRadius: '50%',
      animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      flexShrink: 0,
    }} />
  )
}

// ── Status dot ────────────────────────────────────────────────────────────────
export function StatusDot({ status }) {
  const { theme } = useTheme()
  const colors = { ok: theme.success, loading: theme.warning, error: theme.danger, pending: theme.textMuted }
  const c = colors[status] || theme.textMuted
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 12, height: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'block', boxShadow: status === 'ok' ? `0 0 8px ${c}66` : 'none' }} />
      {status === 'loading' && (
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${c}`, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
      )}
    </span>
  )
}

// ── SparkLine ─────────────────────────────────────────────────────────────────
export function SparkLine({ data, color, height = 32, width = 120 }) {
  const { theme } = useTheme()
  const c = color || theme.accent
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * (height - 6) - 3}`)
    .join(' ')
  const id = `gradient-${c.replace('#', '')}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', display: 'block', maxWidth: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.15" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${height} L${pts} L${width},${height} Z`} fill={`url(#${id})`} stroke="none" />
      <path d={`M${pts}`} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── AnimCounter ───────────────────────────────────────────────────────────────
export function AnimCounter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const easeOut = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(easeOut * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <>{val.toLocaleString()}</>
}

// ── IOC Detail Modal ──────────────────────────────────────────────────────────
export function IOCModal({ ioc, onClose }) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  if (!ioc) return null
  const cc = CONF_COLOR(theme)[ioc.confidence] || theme.textMuted
  const tc = TYPE_COLOR(theme)[ioc.type] || theme.textMuted

  const copy = () => {
    navigator.clipboard.writeText(ioc.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const rows = [
    ioc.malware && ['Threat family', ioc.malware],
    ioc.source && ['Source feed', ioc.source],
    ioc.first_seen && ['Registration', ioc.first_seen],
    ioc.port && ['Network Port', ioc.port],
    ioc.file_type && ['MIME Type', ioc.file_type],
    ioc.status && ['Live Status', ioc.status],
    ioc.due_date && ['Resolution goal', ioc.due_date],
    ioc.score !== undefined && ['Intel Score', `${ioc.score}/100`],
  ].filter(Boolean)

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(241,245,249,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ 
          background: theme.cardSolid, 
          border: `1px solid ${theme.border}`, 
          borderRadius: 20, 
          width: '100%', 
          maxWidth: 580, 
          padding: 32, 
          position: 'relative', 
          boxShadow: `0 24px 64px -12px rgba(15,23,42,0.1)`,
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: '#e2e8f0', border: 'none', color: theme.textSecondary, cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <div style={{ width: 16, height: 16 }}><Icons.X /></div>
        </button>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <Badge label={ioc.type} color={tc} />
          <Badge label={ioc.confidence} color={cc} variant="outline" />
        </div>

        <div style={{ position: 'relative', marginBottom: 28 }}>
          <div style={{ 
            fontFamily: "var(--font-mono)", 
            fontSize: 14, 
            color: theme.text, 
            wordBreak: 'break-all', 
            background: '#f8fafc',
            padding: '16px 54px 16px 16px', 
            borderRadius: 12, 
            border: `1px solid ${theme.border}`, 
            lineHeight: 1.6 
          }}>
            {ioc.value}
          </div>
          <button onClick={copy} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: copied ? theme.accent : theme.textMuted, cursor: 'pointer', width: 22, height: 22, transition: 'color 0.2s' }}>
            <Icons.Copy />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ padding: '12px 16px', background: `${theme.bg}aa`, borderRadius: 10, border: `1px solid ${theme.borderLight}` }}>
              <div style={{ fontSize: 10, color: theme.textMuted, letterSpacing: '0.04em', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary, fontFamily: "var(--font-mono)" }}>{v}</div>
            </div>
          ))}
        </div>

        {ioc.description && (
          <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6, padding: '14px 16px', background: `${theme.bg}aa`, borderRadius: 10, marginBottom: 20, border: `1px solid ${theme.borderLight}` }}>
            {ioc.description}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(ioc.tags || []).filter(Boolean).slice(0, 8).map(t => (
            <Badge key={t} label={t} color={theme.secondary} />
          ))}
        </div>
      </div>
    </div>
  )
}
