/**
 * Run the daily reminder job by hand.
 *
 * Useful for checking what a given date would send without waiting for the
 * scheduler, and for a first live test after setting up SMTP.
 *
 *   node run-reminders.js                  today, really sends
 *   node run-reminders.js --dry            today, prints only
 *   node run-reminders.js 2026-11-20 --dry a week before Black Friday 2026
 */
import { runReminders } from './server.js'
import { todayISO } from './reminders.js'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry')
const date = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? todayISO()

const summary = await runReminders(date, { dryRun })
console.log(dryRun ? 'Dry run complete.' : 'Done.', JSON.stringify(summary))
