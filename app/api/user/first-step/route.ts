import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'
import { env } from '@/lib/env'
import { LAUNCHPAD_FIRST_STEP_SLUG } from '@/lib/launchpad'

export const dynamic = 'force-dynamic'

// GET /api/user/first-step — gated payload for the LAUNCHPAD: FIRST STEP bootcamp.
// Enrollment is re-verified here; the dashboard tab visibility is never the only gate.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let decoded: any
  try { decoded = jwt.verify(token, env.JWT_SECRET) } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const userId = decoded.userId

  // Two-step lookup instead of an FK join (consistent with the rest of the codebase)
  const { data: enrollmentRows } = await supabase
    .from('Enrollment')
    .select('id, enrolledAt, bundleId, status')
    .eq('userId', userId)
    .eq('status', 'ACTIVE')

  const bundleIds = (enrollmentRows || []).map((e: any) => e.bundleId).filter(Boolean)
  const { data: bundleRows } = bundleIds.length > 0
    ? await supabase
        .from('Bundle')
        .select('id, slug, name, tagline, duration, schedule, startDate, cohortSlug')
        .in('id', bundleIds)
    : { data: [] as any[] }

  const bundle = (bundleRows || []).find((b: any) => b.slug === LAUNCHPAD_FIRST_STEP_SLUG)
  if (!bundle) {
    return NextResponse.json({ error: 'Not enrolled in Launchpad: First Step' }, { status: 403 })
  }

  const enrollment = (enrollmentRows || []).find((e: any) => e.bundleId === bundle.id)

  // Community links live on the Cohort so they can be set from the DB without a deploy
  const { data: cohort } = await supabase
    .from('Cohort')
    .select('slug, name, accentHex, discordLink, whatsappLink')
    .eq('slug', bundle.cohortSlug)
    .single()

  return NextResponse.json({
    bundle,
    cohort: cohort || null,
    enrolledAt: enrollment?.enrolledAt || null,
    discordLink: cohort?.discordLink || null,
  })
}
