import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

let resend: Resend | null = null
if (resendApiKey) {
  resend = new Resend(resendApiKey)
}

// ─── 1. PENDING EMAIL (sent on payment submission) ───

export async function sendPendingEmail(
  to: string,
  userName: string,
  bundleName: string,
  amount: number
) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set, skipping pending email')
    return
  }

  try {
    await resend.emails.send({
      from: 'Revamp <noreply@letsrevamp.in>',
      to,
      subject: '⏳ Payment Received — Under Verification',
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800;">Payment Under Review ⏳</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">We're verifying your transaction.</p>
          </div>
          
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #d1d5db;">Hey <strong style="color: #fff;">${userName}</strong>,</p>
            
            <p style="font-size: 16px; color: #d1d5db;">
              We've received your payment of <strong style="color: #f59e0b;">₹${amount}</strong> for 
              <strong style="color: #60a5fa;">${bundleName}</strong>. Our team is verifying your transaction.
            </p>

            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <div style="display: inline-block; padding: 8px 20px; background: #78350f; border-radius: 999px; font-size: 14px; font-weight: 600; color: #fbbf24;">
                ⏳ Pending Verification
              </div>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 14px;">
                Usually takes less than <strong style="color: #fff;">24 hours</strong>
              </p>
            </div>

            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px;">What Happens Next?</h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #d1d5db; font-size: 14px; line-height: 2;">
                <li>Our team verifies your transaction ID</li>
                <li>You'll receive a confirmation email</li>
                <li>We'll send your community invite once it's verified</li>
                <li>Your referral link will be on your dashboard</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
              Questions? Reply to this email.<br/>
              — Team Revamp
            </p>
          </div>
        </div>
      `,
    })
    console.log(`✅ Pending email sent to ${to}`)
  } catch (error) {
    console.error('Failed to send pending email:', error)
  }
}

// ─── 2. CONFIRMATION EMAIL (sent on admin approval) ───

export async function sendPaymentConfirmationEmail(
  to: string,
  userName: string,
  bundleName: string,
  referralCode: string
) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set, skipping confirmation email')
    return
  }

  try {
    await resend.emails.send({
      from: 'Revamp <noreply@letsrevamp.in>',
      to,
      subject: '🎉 Payment Confirmed — Welcome to Revamp!',
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800;">Welcome to Revamp! 🚀</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">Your payment is confirmed. Let's get started!</p>
          </div>
          
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #d1d5db;">Hey <strong style="color: #fff;">${userName}</strong>,</p>
            
            <p style="font-size: 16px; color: #d1d5db;">
              Your enrollment in <strong style="color: #60a5fa;">${bundleName}</strong> is confirmed! 🎉
            </p>

            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <div style="display: inline-block; padding: 8px 20px; background: #064e3b; border-radius: 999px; font-size: 14px; font-weight: 600; color: #34d399;">
                ✅ Verified & Confirmed
              </div>
            </div>

            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="margin: 0 0 16px; font-size: 14px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px;">✅ What's Next</h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #d1d5db; font-size: 14px; line-height: 2.2;">
                <li>Your <strong style="color: #fff;">community invite and setup guide</strong> are on your dashboard</li>
                <li>Your <strong style="color: #10b981;">referral link</strong> is available on your dashboard</li>
                <li>Share it with friends to earn <strong style="color: #10b981;">₹100–200</strong> per referral!</li>
              </ul>
            </div>

            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px;">📊 Your Dashboard</h3>
              <p style="margin: 0 0 12px; color: #d1d5db; font-size: 14px;">Track orders, referral earnings, and more:</p>
              <a href="https://letsrevamp.in/dashboard" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px;">
                Go to Dashboard →
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
              See you in the workshop! 🔥<br/>
              — Team Revamp
            </p>
          </div>
        </div>
      `,
    })
    console.log(`✅ Confirmation email sent to ${to}`)
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
  }
}

// ─── 3. REFERRAL EARNING EMAIL (sent to referrer on approval) ───

export async function sendReferralEarningEmail(
  to: string,
  referrerName: string,
  referredUserName: string,
  bundleName: string,
  earning: number,
  totalEarnings: number
) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set, skipping referral email')
    return
  }

  try {
    await resend.emails.send({
      from: 'Revamp <noreply@letsrevamp.in>',
      to,
      subject: `💰 You earned ₹${earning} from a referral!`,
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #047857 0%, #10b981 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800;">Cha-ching! 💰</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">Someone used your referral link.</p>
          </div>
          
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #d1d5db;">Hey <strong style="color: #fff;">${referrerName}</strong>,</p>
            
            <p style="font-size: 16px; color: #d1d5db;">
              <strong style="color: #fff;">${referredUserName}</strong> just enrolled in 
              <strong style="color: #60a5fa;">${bundleName}</strong> using your referral!
            </p>

            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">This Referral</p>
              <p style="margin: 0; font-size: 48px; font-weight: 800; color: #10b981;">₹${earning}</p>
            </div>

            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Total Earnings</p>
              <p style="margin: 0; font-size: 32px; font-weight: 700; color: #fff;">₹${totalEarnings}</p>
            </div>

            <p style="font-size: 14px; color: #d1d5db; text-align: center;">
              Keep sharing to earn more! 🚀
            </p>

            <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
              — Team Revamp
            </p>
          </div>
        </div>
      `,
    })
    console.log(`✅ Referral earning email sent to ${to}`)
  } catch (error) {
    console.error('Failed to send referral earning email:', error)
  }
}
