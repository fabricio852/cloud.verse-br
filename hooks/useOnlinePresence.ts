import { useEffect, useState } from 'react'
import { initPresence, PresenceHandle } from '../services/analytics'

export function useOnlinePresence() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let handle: PresenceHandle | null = null
    handle = initPresence(setCount)
    return () => {
      handle?.cleanup()
    }
  }, [])

  return { online: count }
}

