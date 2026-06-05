import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase credentials not configured. Some features may not work.')
}

export const supabase = supabaseInstance
