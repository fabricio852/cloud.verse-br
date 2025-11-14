import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export function useTotalVisitors(pollMs = 30000) {
  const [count, setCount] = useState<bigint | number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = async () => {
    try {
      const { data, error } = await supabase.rpc('total_visitors')
      if (error) throw error
      setCount((data as any) ?? 0)
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

