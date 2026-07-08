import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const STORAGE_KEY = 'sodamax-checkout-session'

const CheckoutSessionContext = createContext(null)

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.phone) return null
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function persistSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function CheckoutSessionProvider({ children }) {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('s') || '', [searchParams])
  const [storedSession, setStoredSession] = useState(readStoredSession)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function verify() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/checkout-session?s=${encodeURIComponent(token)}`)
        const body = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(body.error || 'Could not verify checkout link.')
        }

        if (!cancelled) {
          persistSession(body)
          setStoredSession(body)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not verify checkout link.')
          setStoredSession(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [token])

  const session = storedSession
  const fromWhatsApp = Boolean(session?.phone)
  const lockedPhone = fromWhatsApp
  const lockedName = fromWhatsApp && Boolean(session?.name)

  const value = useMemo(
    () => ({
      session,
      phone: session?.phone || '',
      name: session?.name || '',
      fromWhatsApp,
      lockedName,
      lockedPhone,
      loading,
      error,
    }),
    [session, fromWhatsApp, lockedName, lockedPhone, loading, error],
  )

  return (
    <CheckoutSessionContext.Provider value={value}>{children}</CheckoutSessionContext.Provider>
  )
}

/** Resolve signed checkout session from ?s= token (verified server-side). */
export function useCheckoutSession() {
  const context = useContext(CheckoutSessionContext)
  if (!context) {
    throw new Error('useCheckoutSession must be used within CheckoutSessionProvider')
  }
  return context
}
