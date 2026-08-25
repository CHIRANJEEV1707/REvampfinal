/**
 * Seeds the LAUNCHPAD: FIRST STEP bundle from lib/cohorts.ts.
 *
 * Idempotent — safe to re-run. Creates the row as isActive:false so the event
 * stays off /domains and /cohort/launchpad while it is being tested. Flip
 * isActive to true (Supabase dashboard, or `--activate`) to go live.
 *
 *   npx tsx scripts/seed_first_step.ts
 *   npx tsx scripts/seed_first_step.ts --activate
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import crypto from 'crypto'
import { COHORTS } from '../lib/cohorts'
import { LAUNCHPAD_FIRST_STEP_SLUG } from '../lib/launchpad'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ACTIVATE = process.argv.includes('--activate')

async function main() {
  const cohort = COHORTS.launchpad
  const bundleCfg = cohort.bundles.find((b) => b.id === LAUNCHPAD_FIRST_STEP_SLUG)
  const details = cohort.workshopDetails[LAUNCHPAD_FIRST_STEP_SLUG]

  if (!bundleCfg || !details) {
    throw new Error(`${LAUNCHPAD_FIRST_STEP_SLUG} missing from lib/cohorts.ts`)
  }

  // The parent cohort must already exist — we are adding a product, not a category.
  const { data: cohortRow } = await supabase
    .from('Cohort')
    .select('slug')
    .eq('slug', 'launchpad')
    .single()

  if (!cohortRow) throw new Error('launchpad cohort not found — nothing to attach to')

  const payload = {
    cohortSlug: 'launchpad',
    name: bundleCfg.name,
    tagline: details.tagline,
    originalPrice: bundleCfg.originalPrice,
    eventPrice: bundleCfg.eventPrice,
    isDiscounted: bundleCfg.isDiscounted,
    isPrimary: bundleCfg.isPrimary,
    status: 'DRAFT',
    duration: details.duration,
    startDate: details.startDate,
    schedule: details.schedule,
    // No real seat cap — null keeps the seat meter off the workshop page.
    maxSeats: details.maxSeats || null,
    seatsLeft: details.seatsLeft || null,
    certificateIncluded: false,
    features: bundleCfg.features,
    highlights: details.highlights,
    curriculum: details.curriculum,
    outcomes: details.outcomes,
  }

  const { data: existing } = await supabase
    .from('Bundle')
    .select('id, isActive')
    .eq('slug', LAUNCHPAD_FIRST_STEP_SLUG)
    .maybeSingle()

  if (existing) {
    // Never silently flip visibility on an update — only --activate does that.
    const update: Record<string, unknown> = { ...payload }
    if (ACTIVATE) update.isActive = true

    const { error } = await supabase.from('Bundle').update(update).eq('id', existing.id)
    if (error) throw error
    console.log(`updated  ${LAUNCHPAD_FIRST_STEP_SLUG}  (isActive: ${ACTIVATE ? true : existing.isActive})`)
  } else {
    const { error } = await supabase.from('Bundle').insert({
      id: crypto.randomUUID(),
      slug: LAUNCHPAD_FIRST_STEP_SLUG,
      isActive: ACTIVATE,
      createdAt: new Date().toISOString(),
      ...payload,
    })
    if (error) throw error
    console.log(`created  ${LAUNCHPAD_FIRST_STEP_SLUG}  (isActive: ${ACTIVATE})`)
  }

  const { data: row } = await supabase
    .from('Bundle')
    .select('slug, cohortSlug, name, eventPrice, isActive, isPrimary, maxSeats, certificateIncluded')
    .eq('slug', LAUNCHPAD_FIRST_STEP_SLUG)
    .single()
  console.log(row)
}

main().catch((e) => { console.error(e); process.exit(1) })
