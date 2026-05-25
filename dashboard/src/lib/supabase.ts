import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

/** true si les variables d'environnement sont renseignées */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Client Supabase — utiliser uniquement si isSupabaseConfigured === true.
 * En l'absence des variables, le client est créé avec des valeurs placeholder
 * pour éviter un crash au chargement du module.
 */
export const supabase = createClient(
  supabaseUrl     || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } },
  },
)
