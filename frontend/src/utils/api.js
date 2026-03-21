const BASE = '/api/v1'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

export const api = {
  // Stats
  getStats: () => apiFetch('/stats/'),

  // Feeds
  getFeeds: () => apiFetch('/feeds/'),
  getFeed: (id) => apiFetch(`/feeds/${id}`),
  refreshFeed: (id) => apiFetch(`/feeds/${id}/refresh`, { method: 'POST' }),
  refreshAll: () => apiFetch('/feeds/refresh-all', { method: 'POST' }),

  // IOCs
  getIOCs: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'All')
    ).toString()
    return apiFetch(`/iocs/${qs ? '?' + qs : ''}`)
  },
  getIOC: (id) => apiFetch(`/iocs/${id}`),
  lookupIOCs: (values) => apiFetch('/iocs/lookup', {
    method: 'POST',
    body: JSON.stringify({ values }),
  }),

  // Search
  search: (q, limit = 50) => apiFetch(`/search/?q=${encodeURIComponent(q)}&limit=${limit}`),
}
