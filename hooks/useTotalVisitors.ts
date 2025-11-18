import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { getSiteTag } from '../services/analytics'

export function useTotalVisitors(pollMs = 30000) {
  const [count, setCount] = useState<bigint | number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = async () => {
    try {
      const site = getSiteTag()
      let query = supabase
        .from('sessions')
        .select('anon_id', { count: 'exact', head: true })
        .neq('anon_id', null)

      if (site) {
        query = query.contains('utm', { __site: site })
      }

      const { count, error } = await query
      if (error) throw error
      setCount(count ?? 0)
      setError(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to load visitors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCount()
    if (pollMs > 0) {
      const id = setInterval(fetchCount, pollMs)
      return () => clearInterval(id)
    }
  }, [pollMs])

  return { totalVisitors: Number(count) || 0, loading, error }
}

