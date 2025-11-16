import { supabase, supabaseMissingEnv } from './supabaseClient'

const ANON_KEY = 'cv_anon_id'
const SESSION_KEY = 'cv_session_id'

export function getLocale(): string {
  try {
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/en')) return 'en'
    if (typeof navigator !== 'undefined' && navigator.language) return navigator.language
  } catch {}
  return 'pt-BR'
}

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
  if (supabaseMissingEnv) return null
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
  const locale = getLocale()

  const sid = uuid()
  const { error } = await supabase
    .from('sessions')
    .insert({
      id: sid,
      anon_id: anonId,
      user_id: userId,
      initial_path: initialPath,
      referrer,
      utm,
      user_agent: userAgent,
      locale,
    })

  if (error) {
    console.warn('[analytics] ensureSession insert error', error)
    return null
  }

  try { localStorage.setItem(SESSION_KEY, sid) } catch {}
  return sid
}

function getSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export async function trackPageview(path?: string) {
  if (supabaseMissingEnv) return
  const sessionId = getSessionId() || (await ensureSession())
  const p = path || (window.location.pathname + window.location.search)
  const referrer = document.referrer || null
  const utm = parseUtm()
  const locale = getLocale()

  const { error } = await supabase.from('pageviews').insert({
    session_id: sessionId || null,
    path: p,
    referrer,
    utm,
    locale,
  })

  if (!error) {
    // best-effort: update last_seen and notify listeners to refresh counters
    if (sessionId) {
      supabase.from('sessions')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', sessionId)
        .then(() => {})
        .catch(() => {})
    }
    try { window.dispatchEvent(new CustomEvent('analytics:pageview-recorded')) } catch {}
  }
}

export async function trackEvent(name: string, props?: Record<string, any>) {
  if (supabaseMissingEnv) return
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
export function initPresence(onChange: (count: number) => void, channelName: string = 'presence:site'): PresenceHandle {
  if (supabaseMissingEnv) {
    onChange(0)
    return {
      getCount: () => 0,
      cleanup: () => {}
    }
  }
  const anon = getAnonId()
  const channel = supabase.channel(channelName, {
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

