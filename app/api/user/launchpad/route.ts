import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'
import { env } from '@/lib/env'
import { LAUNCHPAD_FLAGSHIP_SLUG } from '@/lib/launchpad'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let decoded: any
  try { decoded = jwt.verify(token, env.JWT_SECRET) } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const userId = decoded.userId

  // Check for active launchpad enrollment — two-step to avoid FK join issues
  const { data: enrollmentRows } = await supabase
    .from('Enrollment')
    .select('id, enrolledAt, bundleId')
    .eq('userId', userId)
    .eq('status', 'ACTIVE')

  const bundleIds = (enrollmentRows || []).map((e: any) => e.bundleId).filter(Boolean)
  const { data: bundleRows } = bundleIds.length > 0
    ? await supabase.from('Bundle').select('id, name, slug, startDate, cohortSlug').in('id', bundleIds)
    : { data: [] as any[] }

  const bundleMap: Record<string, any> = Object.fromEntries((bundleRows || []).map((b: any) => [b.id, b]))
  const allEnrollments = (enrollmentRows || []).map((e: any) => ({ ...e, bundle: bundleMap[e.bundleId] || null }))

  // Gate on the flagship programme specifically — other Launchpad products
  // (e.g. the 2-hour First Step bootcamp) must not unlock this dashboard.
  const enrollment = allEnrollments.find((e: any) => e.bundle?.slug === LAUNCHPAD_FLAGSHIP_SLUG)
  if (!enrollment) return NextResponse.json({ error: 'Not enrolled in Launchpad' }, { status: 403 })

  const [
    { data: profile },
    { data: sessions },
    { data: myAttendances },
    { data: myHomework },
    { data: peerEnrollmentRows },
  ] = await Promise.all([
    supabase.from('LaunchpadProfile').select('*').eq('userId', userId).single(),
    supabase.from('LaunchpadSession').select('id, week, day, title, subtitle, topics, homework, homeworkType, resourceLinks, sessionDate, joinLink, recordingUrl, isVisible, isLive, createdAt').eq('isVisible', true).order('week', { ascending: true }).order('day', { ascending: true }),
    supabase.from('LaunchpadAttendance').select('sessionId').eq('userId', userId),
    supabase.from('HomeworkSubmission').select('sessionId, type, content, status, submittedAt').eq('userId', userId),
    supabase.from('Enrollment')
      .select('userId')
      .eq('bundleId', enrollment.bundleId)
      .eq('status', 'ACTIVE')
      .neq('userId', userId)
      .limit(8),
  ])

  const peerIds = (peerEnrollmentRows || []).map((e: any) => e.userId).filter(Boolean)

  // Two-step: fetch peer users + connection states in parallel (avoids PostgREST FK join issues)
  const [{ data: peerUsers }, { data: myConnections }] = await Promise.all([
    peerIds.length > 0
      ? supabase.from('User').select('id, name, githubUrl, linkedinUrl').in('id', peerIds)
      : Promise.resolve({ data: [] }),
    peerIds.length > 0
      ? supabase.from('Connection')
          .select('id, fromUserId, toUserId, status')
          .or(`and(fromUserId.eq.${userId},toUserId.in.(${peerIds.join(',')})),and(toUserId.eq.${userId},fromUserId.in.(${peerIds.join(',')}))`)
      : Promise.resolve({ data: [] }),
  ])

  // Map connection state per peer
  const connMap: Record<string, { id: string; state: 'connected' | 'pending_out' | 'pending_in' }> = {}
  for (const c of (myConnections || [])) {
    const peerId = c.fromUserId === userId ? c.toUserId : c.fromUserId
    if (c.status === 'ACCEPTED') connMap[peerId] = { id: c.id, state: 'connected' }
    else if (c.status === 'PENDING' && c.fromUserId === userId) connMap[peerId] = { id: c.id, state: 'pending_out' }
    else if (c.status === 'PENDING' && c.toUserId === userId) connMap[peerId] = { id: c.id, state: 'pending_in' }
  }

  const attendedIds = new Set((myAttendances || []).map((a: any) => a.sessionId))
  const homeworkMap = Object.fromEntries((myHomework || []).map((h: any) => [h.sessionId, h]))

  return NextResponse.json({
    profile: profile || null,
    sessions: (sessions || []).map((s: any) => ({
      ...s,
      attended: attendedIds.has(s.id),
      homework_submission: homeworkMap[s.id] || null,
    })),
    enrolledAt: enrollment.enrolledAt,
    bundle: enrollment.bundle,
    peers: (peerUsers || []).map((u: any) => ({
      ...u,
      connectionId: connMap[u.id]?.id || null,
      connectionState: connMap[u.id]?.state || 'none',
    })),
    totalAttended: attendedIds.size,
    totalSessions: (sessions || []).length,
  })
}
