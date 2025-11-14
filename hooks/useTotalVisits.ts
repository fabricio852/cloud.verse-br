import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export function useTotalVisits(pollMs = 30000) {
  const [count, setCount] = useState<bigint | number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = async () => {
    try {
      const { data, error } = await supabase.rpc('total_visits')
      if (error) throw error
      setCount((data as any) ?? 0)
      setError(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to load visits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCount()
    // Immediate refresh when a pageview is recorded locally
    const handler = () => fetchCount()
    window.addEventListener('analytics:pageview-recorded', handler)

    let id: any
    if (pollMs > 0) {
      id = setInterval(fetchCount, pollMs)
    }
    return () => {
      window.removeEventListener('analytics:pageview-recorded', handler)
      if (id) clearInterval(id)
    }
  }, [pollMs])

  return { totalVisits: Number(count) || 0, loading, error }
}

