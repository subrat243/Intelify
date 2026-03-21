import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * usePolling — fetches data immediately and re-fetches every `intervalMs`.
 * Returns { data, loading, error, refetch }
 */
export function usePolling(fetchFn, intervalMs = 10000, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)

  const fetchFnRef = useRef(fetchFn)
  useEffect(() => { fetchFnRef.current = fetchFn }, [fetchFn])

  const refetch = useCallback(async () => {
    try {
      setError(null)
      const result = await fetchFnRef.current()
      if (mountedRef.current) {
        setData(result)
        setLoading(false)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message)
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    setLoading(true)
    refetch()
    timerRef.current = setInterval(refetch, intervalMs)
    return () => {
      mountedRef.current = false
      clearInterval(timerRef.current)
    }
  }, [intervalMs, refetch, ...deps])

  return { data, loading, error, refetch }
}
