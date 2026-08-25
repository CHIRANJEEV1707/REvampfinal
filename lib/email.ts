import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'REvamp <onboarding@resend.dev>' // Use verified domain in production

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to REvamp, ${name.split(' ')[0]}! 🚀`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px;">
          <img src="https://ik.imagekit.io/cotszrkgk/Screenshot_2025-06-25_at_9.10.56_PM-removebg-preview.png?updatedAt=1756648034230" alt="REvamp" style="height: 60px; margin-bottom: 30px;" />
          <h1 style="font-size: 32px; margin-bottom: 16px;">Welcome to the Collective, ${name.split(' ')[0]}!</h1>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">Your account has been created. You can now enroll in workshops, track your progress, and earn through referrals.</p>
          <a href="https://letsrevamp.in/dashboard" style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #0085FF; color: #fff; text-decoration: none; font-weight: bold; font-size: 14px;">Go to Dashboard →</a>
          <p style="color: #555; font-size: 12px; margin-top: 40px;">© 2026 REvamp Tech Collective</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Welcome email error:', error)
  }
}

export async function sendDomainUpdateEmail(to: string, userName: string, domainName: string, workshopName: string, workshopSlug: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🔥 New in ${domainName}: ${workshopName}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px;">
          <img src="https://ik.imagekit.io/cotszrkgk/Screenshot_2025-06-25_at_9.10.56_PM-removebg-preview.png?updatedAt=1756648034230" alt="REvamp" style="height: 60px; margin-bottom: 30px;" />
          <p style="color: #0085FF; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px;">New Workshop Alert</p>
          <h1 style="font-size: 28px; margin-bottom: 16px;">${workshopName}</h1>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">Hey ${userName.split(' ')[0]}, a new workshop just dropped in <strong style="color: #fff;">${domainName}</strong> — a domain you follow.</p>
          <a href="https://letsrevamp.in/workshop/${workshopSlug}" style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #0085FF; color: #fff; text-decoration: none; font-weight: bold; font-size: 14px;">Check it Out →</a>
          <p style="color: #555; font-size: 12px; margin-top: 40px;">You're receiving this because you follow ${domainName} on REvamp. <a href="https://letsrevamp.in/dashboard?tab=domains" style="color: #555;">Unsubscribe</a></p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Domain update email error:', error)
  }
}

export async function sendOrderConfirmationEmail(to: string, userName: string, workshopName: string, amount: number) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Submission received — ${workshopName}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px;">
          <img src="https://ik.imagekit.io/cotszrkgk/Screenshot_2025-06-25_at_9.10.56_PM-removebg-preview.png?updatedAt=1756648034230" alt="REvamp" style="height: 60px; margin-bottom: 30px;" />
          <p style="color: #4ade80; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px;">Submission Received</p>
          <h1 style="font-size: 28px; margin-bottom: 16px;">Thanks, ${userName.split(' ')[0]}!</h1>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">We've received your payment details for <strong style="color: #fff;">${workshopName}</strong>. Our team will verify your transaction, then your dashboard unlocks with everything you need.</p>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">Your referral link will be available on your dashboard once verified.</p>
          <a href="https://letsrevamp.in/dashboard?tab=orders" style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #0085FF; color: #fff; text-decoration: none; font-weight: bold; font-size: 14px;">View Order Status →</a>
          <p style="color: #555; font-size: 12px; margin-top: 40px;">© 2026 REvamp Tech Collective</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Order confirmation email error:', error)
  }
}
