/**
 * Product slugs under the `launchpad` cohort.
 *
 * Launchpad is a brand/category, not a single product. Access gates must key off
 * the specific bundle a student bought — gating on `cohortSlug === 'launchpad'`
 * would hand every Launchpad buyer the 4-week programme dashboard regardless of
 * which product they actually paid for.
 */

/** The 4-week flagship programme (sessions, attendance, homework, badges). */
export const LAUNCHPAD_FLAGSHIP_SLUG = "launchpad-flagship"

/** The 2-hour paid bootcamp (setup guide, countdown, Discord). */
export const LAUNCHPAD_FIRST_STEP_SLUG = "launchpad-first-step"
