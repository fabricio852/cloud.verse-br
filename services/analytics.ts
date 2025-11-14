import { supabase } from './supabaseClient'

const ANON_KEY = 'cv_anon_id'
const SESSION_KEY = 'cv_session_id'

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  // simple fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getAnonId(): string {
  try {
    const existing = localStorage.getItem(ANON_KEY)
    if (existing) return existing
    const id = uuid()
    localStorage.setItem(ANON_KEY, id)
    return id
  } catch {
    return uuid()
  }
}

function parseUtm(): Record<string, string> | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    const out: Record<string, string> = {}
    let has = false
    for (const k of keys) {
      const v = params.get(k)
      if (v) {
        out[k] = v
        has = true
      }
    }
    return has ? out : null
  } catch {
    return null
  }
}

async function getUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

export async function ensureSession(): Promise<string | null> {
  try {
    const cached = localStorage.getItem(SESSION_KEY)
    if (cached) return cached
  } catch {
    // ignore
  }

  const anonId = getAnonId()
  const referrer = document.referrer || null
  const utm = parseUtm()
  const userAgent = navigator.userAgent
  const initialPath = window.location.pathname + window.location.search
  const userId = await getUserId()

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      anon_id: anonId,
      user_id: userId,
      initial_path: initialPath,
      referrer,
      utm,
      user_agent: userAgent,
    })
    .select('id')
    .single()

  if (error) {
    console.warn('[analytics] ensureSession error', error)
    return null
  }

  try {
    localStorage.setItem(SESSION_KEY, data.id)
  } catch {
    // ignore
  }
  return data.id
}

function getSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export async function trackPageview(path?: string) {
  const sessionId = getSessionId() || (await ensureSession())
  const p = path || (window.location.pathname + window.location.search)
  const referrer = document.referrer || null
  const utm = parseUtm()

  await supabase.from('pageviews').insert({
    session_id: sessionId,
    path: p,
    referrer,
    utm,
  })
}

export async function trackEvent(name: string, props?: Record<string, any>) {
  const sessionId = getSessionId() || (await ensureSession())
  const userId = await getUserId()
  await supabase.from('events').insert({
    session_id: sessionId,
    user_id: userId,
    name,
    props: props || null,
  })
}

export interface PresenceHandle {
  getCount: () => number
  cleanup: () => void
}

/**
 * Minimal presence: join a shared channel and expose online count
 */
export function initPresence(onChange: (count: number) => void): PresenceHandle {
  const anon = getAnonId()
  const channel = supabase.channel('presence:site', {
    config: { presence: { key: anon } },
  })

  const getCountFromState = () => {
    const state = channel.presenceState()
    // presenceState() shape: { [key]: [{...}, ...] }
    const keys = Object.keys(state)
    let c = 0
    for (const k of keys) {
      c += (state[k] as any[]).length
    }
    return c
  }

  channel.on('presence', { event: 'sync' }, () => {
    onChange(getCountFromState())
  })

  channel.subscribe(async status => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ at: Date.now() })
      onChange(getCountFromState())
    }
  })

  return {
    getCount: getCountFromState,
    cleanup: () => {
      try { channel.unsubscribe() } catch {}
    },
  }
}

