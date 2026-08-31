/**
 * Send one test email, to check SMTP credentials end to end.
 *
 *   node send-test.js you@example.com
 */
import { sendMail, verifyConnection } from './mailer.js'

const to = process.argv[2]
if (!to) {
  console.error('usage: node send-test.js <address>')
  process.exit(1)
}

await verifyConnection()
console.log('[send-test] SMTP connection and credentials OK')

await sendMail({
  to,
  subject: 'Sale Season — test email',
  text: 'If you are reading this, SMTP is configured correctly.',
  html: '<p>If you are reading this, SMTP is configured correctly.</p>',
})

console.log(`[send-test] sent to ${to}`)
