import nodemailer from 'nodemailer'

/**
 * Outbound email over SMTP.
 *
 * The password must be a Gmail *app password*, not the account password --
 * Google rejects the latter for SMTP on any account with 2-Step
 * Verification, which is required to create an app password in the first
 * place. See README.
 */

const DRY_RUN = process.env.MAIL_DRY_RUN === '1'

function config() {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
    fromName: process.env.SMTP_FROM_NAME || 'Sale Season',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  }
}

/**
 * Fail fast on boot rather than at 08:00 on the morning a reminder was
 * due. A misconfigured mailer that only reveals itself when the scheduler
 * fires is the worst version of this bug.
 */
export function assertConfigured() {
  if (DRY_RUN) {
    console.warn('[mailer] MAIL_DRY_RUN=1 — emails will be logged, not sent')
    return
  }
  const { user, pass } = config()
  if (!user || !pass) {
    throw new Error(
      'SMTP_USER and SMTP_PASSWORD must be set (see .env.example). ' +
        'Set MAIL_DRY_RUN=1 to run locally without sending mail.',
    )
  }
}

let transporter = null

function getTransporter() {
  if (!transporter) {
    const { host, port, user, pass } = config()
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  }
  return transporter
}

export async function sendMail({ to, subject, text, html }) {
  if (DRY_RUN) {
    console.log(`\n--- [dry-run] to: ${to}\n--- subject: ${subject}\n${text}\n---\n`)
    return { dryRun: true }
  }

  const { from, fromName } = config()
  return getTransporter().sendMail({
    from: `"${fromName}" <${from}>`,
    to,
    subject,
    text,
    html,
  })
}

/** Verifies credentials against the SMTP server without sending anything. */
export async function verifyConnection() {
  if (DRY_RUN) return { ok: true, dryRun: true }
  await getTransporter().verify()
  return { ok: true }
}
