import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'
import { env } from '@/lib/env'
import { LAUNCHPAD_FLAGSHIP_SLUG } from '@/lib/launchpad'

export const dynamic = 'force-dynamic'

function getUser(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value
  if (!token) return null
  try { return jwt.verify(token, env.JWT_SECRET) as any } catch { return null }
}

// GET: all homework submissions for the current user
export async function GET(req: NextRequest) {
  const decoded = getUser(req)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('HomeworkSubmission')
    .select('*')
    .eq('userId', decoded.userId)

  return NextResponse.json(data || [])
}

// POST: submit or update homework for a session
export async function POST(req: NextRequest) {
  const decoded = getUser(req)
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId, type, content } = await req.json()
  if (!sessionId || !type) {
    return NextResponse.json({ error: 'sessionId and type required' }, { status: 400 })
  }

  const userId = decoded.userId

  // Verify enrollment — two-step to avoid FK join issues
  const { data: enrollmentRows } = await supabase
    .from('Enrollment').select('bundleId').eq('userId', userId).eq('status', 'ACTIVE')
  const bundleIds = (enrollmentRows || []).map((e: any) => e.bundleId).filter(Boolean)
  const { data: bundleRows } = bundleIds.length > 0
    ? await supabase.from('Bundle').select('id, slug').in('id', bundleIds)
    : { data: [] as any[] }
  const enrolled = (bundleRows || []).some((b: any) => b.slug === LAUNCHPAD_FLAGSHIP_SLUG)
  if (!enrolled) return NextResponse.json({ error: 'Not enrolled in Launchpad' }, { status: 403 })

  // Check existing
  const { data: existing } = await supabase
    .from('HomeworkSubmission')
    .select('id')
    .eq('userId', userId)
    .eq('sessionId', sessionId)
    .single()

  let result
  if (existing) {
    const { data } = await supabase
      .from('HomeworkSubmission')
      .update({ type, content: content || null, status: 'submitted', submittedAt: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
    result = data
  } else {
    const { data } = await supabase
      .from('HomeworkSubmission')
      .insert({
        id: crypto.randomUUID(),
        userId,
        sessionId,
        type,
        content: content || null,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      })
      .select()
      .single()
    result = data
  }

  return NextResponse.json(result)
}
