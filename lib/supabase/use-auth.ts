"use client";

import { useState, useEffect } from 'react'
import { createClient } from './client'

export function useSupabaseAuth() {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      const { data: { session: supaSession } } = await supabase.auth.getSession()
      if (!mounted) return

      if (supaSession?.user) {
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', supaSession.user.id)
            .single()

          setSession({
            user: {
              ...supaSession.user,
              ...(profile || {}),
              id: profile?.id || supaSession.user.id,
              role: profile?.role || 'BUYER',
            },
            expires: supaSession.expires_at,
          })
          setStatus('authenticated')
        } catch {
          setSession({ user: { ...supaSession.user, role: 'BUYER' } })
          setStatus('authenticated')
        }
      } else {
        setSession(null)
        setStatus('unauthenticated')
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      if (newSession?.user) {
        getSession()
      } else {
        setSession(null)
        setStatus('unauthenticated')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { 
    data: session, 
    status, 
    update: (newData: any) => setSession((prev: any) => ({ ...prev, ...newData })) 
  }
}
