import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { adminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { LAUNCHPAD_FLAGSHIP_SLUG } from '@/lib/launchpad'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = await adminAuth(req)
  if (!admin) return unauthorizedResponse()

  // Flagship programme only — the roster/attendance UI is scoped to the 4-week
  // cohort, so other Launchpad products must not appear here.
  const { data: bundles } = await supabase
    .from('Bundle')
    .select('id')
    .eq('slug', LAUNCHPAD_FLAGSHIP_SLUG)

  const bundleIds = (bundles || []).map((b: any) => b.id)
  if (bundleIds.length === 0) return NextResponse.json([])

  // Get all active enrollments
  const { data: enrollments } = await supabase
    .from('Enrollment')
    .select('userId, enrolledAt, bundleId')
    .in('bundleId', bundleIds)
    .eq('status', 'ACTIVE')

  if (!enrollments || enrollments.length === 0) return NextResponse.json([])

  const userIds = enrollments.map((e: any) => e.userId)

  const [
    { data: users },
    { data: profiles },
    { data: attendances },
    { data: sessions },
  ] = await Promise.all([
    supabase.from('User').select('id, name, email, githubUrl, linkedinUrl, createdAt').in('id', userIds),
    supabase.from('LaunchpadProfile').select('*').in('userId', userIds),
    supabase.from('LaunchpadAttendance').select('userId, sessionId').in('userId', userIds),
    supabase.from('LaunchpadSession').select('id, week, day, title').order('week').order('day'),
  ])

  const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.userId, p]))
  const enrollmentMap = Object.fromEntries(enrollments.map((e: any) => [e.userId, e]))

  const attendanceByUser: Record<string, Set<string>> = {}
  for (const a of (attendances || [])) {
    if (!attendanceByUser[a.userId]) attendanceByUser[a.userId] = new Set()
    attendanceByUser[a.userId].add(a.sessionId)
  }

  const totalSessions = (sessions || []).length

  const result = (users || []).map((u: any) => {
    const attended = attendanceByUser[u.id]?.size || 0
    const pct = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0
    return {
      ...u,
      enrolledAt: enrollmentMap[u.id]?.enrolledAt,
      profile: profileMap[u.id] || null,
      attendedSessionIds: Array.from(attendanceByUser[u.id] || []),
      attendedCount: attended,
      totalSessions,
      attendancePct: pct,
      certEligibility: pct >= 80 ? 'COMPLETION' : pct >= 50 ? 'PARTICIPATION' : 'NONE',
    }
  })

  return NextResponse.json({ students: result, sessions: sessions || [] })
}

// POST: upsert a LaunchpadProfile (CSV import / manual creation)
export async function POST(req: NextRequest) {
  const admin = await adminAuth(req)
  if (!admin) return unauthorizedResponse()

  const { userId, experienceLevel, goals, motivation } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { data: existing } = await supabase
    .from('LaunchpadProfile')
    .select('id')
    .eq('userId', userId)
    .single()

  let result
  if (existing) {
    const { data } = await supabase
      .from('LaunchpadProfile')
      .update({ experienceLevel: experienceLevel || 'beginner', goals: goals || [], motivation: motivation || null })
      .eq('userId', userId)
      .select()
      .single()
    result = data
  } else {
    const { data } = await supabase
      .from('LaunchpadProfile')
      .insert({ id: crypto.randomUUID(), userId, experienceLevel: experienceLevel || 'beginner', goals: goals || [], motivation: motivation || null, createdAt: new Date().toISOString() })
      .select()
      .single()
    result = data
  }

  return NextResponse.json(result)
}
