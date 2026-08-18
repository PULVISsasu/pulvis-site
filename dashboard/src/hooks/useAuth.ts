import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type AuthStatus =
  | 'loading'          // session en cours de résolution (démarrage / refresh)
  | 'signed_out'        // pas de session valide
  | 'checking_admin'    // session valide, vérification is_admin() en cours
  | 'forbidden'         // session valide mais utilisateur non-admin
  | 'authorized'        // session valide + is_admin() === true
  | 'error'             // erreur réseau/Supabase pendant la résolution

export interface AuthState {
  status:  AuthStatus
  session: Session | null
  error:   string | null
  signIn:  (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [status,  setStatus]  = useState<AuthStatus>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  const checkAdminAndSet = useCallback(async (s: Session | null) => {
    if (!s) {
      setSession(null)
      setStatus('signed_out')
      return
    }
    setSession(s)
    setStatus('checking_admin')
    try {
      // is_admin() lit auth.uid() côté Postgres à partir du JWT de la session —
      // jamais de rôle fait confiance côté client, la vérité vient de la RLS.
      const { data, error: rpcError } = await supabase.rpc('is_admin')
      if (rpcError) {
        setError(rpcError.message)
        setStatus('error')
        return
      }
      setStatus(data === true ? 'authorized' : 'forbidden')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de vérification des droits')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // 1. Résolution initiale de session (reprise depuis le storage local)
    supabase.auth.getSession().then(({ data, error: sessErr }) => {
      if (!mounted) return
      if (sessErr) {
        setError(sessErr.message)
        setStatus('error')
        return
      }
      void checkAdminAndSet(data.session)
    })

    // 2. Écoute les changements : login, logout, refresh de token, session expirée
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      void checkAdminAndSet(newSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [checkAdminAndSet])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) return { error: signInError.message }
    return { error: null }
    // onAuthStateChange déclenche ensuite checkAdminAndSet automatiquement
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setStatus('signed_out')
  }, [])

  return { status, session, error, signIn, signOut }
}
