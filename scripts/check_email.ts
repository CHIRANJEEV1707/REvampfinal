/**
 * Sends the three purchase-journey emails to one address, to verify delivery.
 *
 *   npx tsx scripts/check_email.ts you@example.com
 *
 * Exists because these failed silently for months: the sandbox sender was
 * rejected with a 403, and the SDK returns { error } instead of throwing.
 */
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env') })

import { sendOrderConfirmationEmail, sendWelcomeEmail } from '../lib/email'
import { sendPaymentConfirmationEmail } from '../lib/emails'

const TO = process.argv[2]
if (!TO) { console.error('usage: npx tsx scripts/check_email.ts <recipient>'); process.exit(1) }

;(async () => {
  console.log(`\n  sending the three purchase-journey emails to ${TO}\n`)
  await sendWelcomeEmail(TO, 'Test User')
  await sendOrderConfirmationEmail(TO, 'Test User', 'LAUNCHPAD: FIRST STEP', 199)
  await sendPaymentConfirmationEmail(TO, 'Test User', 'LAUNCHPAD: FIRST STEP', 'REV-TEST01')
})()
