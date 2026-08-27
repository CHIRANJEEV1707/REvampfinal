import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// For server-side: use service_role key to bypass RLS
// For client-side: use anon key (doesn't have access to service_role)
const supabaseKey = typeof window === 'undefined'
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    // Next.js patches global fetch and persists responses in
    // .next/cache/fetch-cache, which survives server restarts and is restored
    // between Vercel deploys. Without no-store, edits made in the database
    // (prices, dates, isActive) keep serving stale values on the live site —
    // route-level `dynamic = 'force-dynamic'` does not cover this.
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: 'no-store' }),
  },
})
