import { Resend } from 'resend'

let client: Resend | null = null

/**
 * Resolved on first use rather than at module load, so the key is read after the
 * runtime has populated process.env regardless of module evaluation order.
 */
function getClient(): Resend | null {
  if (client) return client
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  client = new Resend(apiKey)
  return client
}

/**
 * All transactional mail must come from the verified domain.
 *
 * `onboarding@resend.dev` is Resend's sandbox sender and is rejected with a 403
 * for any recipient other than the account owner — it silently broke every
 * signup and purchase email.
 */
export const FROM_EMAIL = 'REvamp <noreply@letsrevamp.in>'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Sends one transactional email, returning whether it actually left.
 *
 * The Resend SDK resolves with `{ data, error }` rather than throwing on a 4xx,
 * so `await resend.emails.send(...)` inside a try/catch looks like success even
 * when nothing was sent. Always check the returned error.
 */
export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<boolean> {
  const resend = getClient()
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`)
    return false
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from ?? FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error(`[email] FAILED "${subject}" to ${to}:`, JSON.stringify(error))
      return false
    }

    console.log(`[email] sent "${subject}" to ${to} (id: ${data?.id})`)
    return true
  } catch (err) {
    // Network-level failure — the SDK only throws for these.
    console.error(`[email] THREW while sending "${subject}" to ${to}:`, err)
    return false
  }
}
