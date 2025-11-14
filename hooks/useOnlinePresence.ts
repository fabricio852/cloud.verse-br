import { useEffect, useState } from 'react'
import { initPresence, PresenceHandle } from '../services/analytics'

export function useOnlinePresence(channelName?: string) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let handle: PresenceHandle | null = null
    handle = initPresence(setCount, channelName || 'presence:site')
    return () => {
      handle?.cleanup()
    }
  }, [channelName])

  return { online: count }
}

