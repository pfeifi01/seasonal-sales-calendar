import express from 'express'
import rateLimit from 'express-rate-limit'
import { Cron } from 'croner'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadCatalog } from './catalog.js'
import { dueReminders, sentKey, todayISO } from './reminders.js'
import { assertConfigured, sendMail } from './mailer.js'
import { confirmEmail, landingPage, managePage, reminderEmail } from './templates.js'
import {
  confirmSubscription,
  confirmedSubscriptions,
  markSent,
  findByToken,
  removeSubscription,
  updatePreferences,
  sentKeys,
  upsertSubscription,
} from './store.js'

const PORT = Number(process.env.PORT || 4000)
const SITE_URL = process.env.SITE_URL || 'https://sales.pfeifhofer.dev'
const TZ = process.env.REMINDER_TZ || 'Europe/Vienna'
const REMINDER_CRON = process.env.REMINDER_CRON || '0 8 * * *'

const COUNTRIES = new Set(['AT', 'DE', 'CH', 'IT'])
const LANGS = new Set(['en', 'de', 'it'])
const CATEGORIES = new Set([
  'fashion',
  'electronics',
  'food',
  'home',
  'sports',
  'beauty',
  'travel',
  'toys',
  'general',
])

// Loud, immediate failure beats a scheduler that silently sends nothing.
assertConfigured()

const catalog = loadCatalog()
console.log(
  `[catalog] ${catalog.events.size} events, ${catalog.occurrences.length} occurrences, ` +
    `generated ${catalog.generatedAt}`,
)

// Published Italian and South Tyrolean dates only cover the years somebody
// has entered. Past that the calendar still works, but every regulated
// event quietly degrades to an estimate — so say so at boot rather than
// letting it pass unnoticed for a year.
const currentYear = Number(todayISO(new Date(), TZ).slice(0, 4))
if (catalog.confirmedThrough < currentYear) {
  console.warn(
    `[catalog] WARNING: confirmed dates only run through ${catalog.confirmedThrough}, ` +
      `but it is ${currentYear}. Regulated events are being estimated. ` +
      `Add this year's published dates to src/data/events.ts (see docs/DATA_SOURCES.md).`,
  )
}

const app = express()
app.use(express.json({ limit: '8kb' }))
// The preferences page linked from emails is a plain server-rendered form,
// so its POST arrives urlencoded rather than as JSON.
app.use(express.urlencoded({ extended: false, limit: '8kb' }))
// nginx is the only thing in front of this container, so the first proxy hop
// is trusted -- without it every request looks like it comes from nginx and
// the rate limiter would be global rather than per client.
app.set('trust proxy', 1)

// The thing actually worth limiting is sending confirmation emails to
// arbitrary addresses, so only successful signups count. Otherwise someone
// mistyping their address five times would be locked out for an hour, while
// a rejected request costs nothing anyway.
const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  skipFailedRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests' },
})

// ── validation ──────────────────────────────────────────────────────────

// Deliberately permissive: the confirmation email is the real check on
// whether an address exists, so a clever regex buys nothing here.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function parseSubscription(body) {
  const email = String(body?.email ?? '').trim().toLowerCase()
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return { error: 'invalid_email' }

  const country = String(body?.country ?? '').toUpperCase()
  if (!COUNTRIES.has(country)) return { error: 'invalid_country' }

  const lang = String(body?.lang ?? 'en')
  if (!LANGS.has(lang)) return { error: 'invalid_lang' }

  const rawCategories = Array.isArray(body?.categories) ? body.categories : []
  const categories = [...new Set(rawCategories.map(String))]
  if (categories.some((c) => !CATEGORIES.has(c))) return { error: 'invalid_category' }

  const rawLeads = Array.isArray(body?.leadDays) && body.leadDays.length ? body.leadDays : [7, 1]
  const leadDays = [...new Set(rawLeads.map(Number))]
  if (leadDays.length > 4 || leadDays.some((n) => !Number.isInteger(n) || n < 0 || n > 60)) {
    return { error: 'invalid_lead_days' }
  }

  return { value: { email, country, lang, categories, leadDays } }
}

// ── routes ──────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    events: catalog.events.size,
    occurrences: catalog.occurrences.length,
    catalogGeneratedAt: catalog.generatedAt,
    confirmedThrough: catalog.confirmedThrough,
    datesNeedRefresh: catalog.confirmedThrough < Number(todayISO(new Date(), TZ).slice(0, 4)),
    today: todayISO(new Date(), TZ),
  })
})

app.post('/api/subscribe', subscribeLimiter, async (req, res) => {
  const { value, error } = parseSubscription(req.body)
  if (error) return res.status(400).json({ error })

  const sub = upsertSubscription(value)

  // Already confirmed: preferences were updated, no new confirmation needed.
  if (sub.confirmed) return res.json({ status: 'updated' })

  const url = `${SITE_URL}/api/confirm?token=${encodeURIComponent(sub.confirmToken)}`
  try {
    await sendMail({ to: sub.email, ...confirmEmail({ lang: sub.lang, confirmUrl: url }) })
  } catch (err) {
    console.error('[subscribe] confirmation email failed:', err.message)
    return res.status(502).json({ error: 'email_failed' })
  }

  res.json({ status: 'confirmation_sent' })
})

app.get('/api/confirm', (req, res) => {
  const sub = confirmSubscription(String(req.query.token ?? ''))
  const lang = sub?.lang ?? 'en'
  res
    .status(sub ? 200 : 404)
    .type('html')
    .send(landingPage(sub ? 'confirmed' : 'invalid', lang, SITE_URL))
})

app.get('/api/unsubscribe', (req, res) => {
  const sub = removeSubscription(String(req.query.token ?? ''))
  const lang = sub?.lang ?? 'en'
  res
    .status(sub ? 200 : 404)
    .type('html')
    .send(landingPage(sub ? 'unsubscribed' : 'invalid', lang, SITE_URL))
})

// The preferences page is reached from a link in every reminder, keyed by
// the unsubscribe token. That token is already a capability to change this
// subscription, so reusing it avoids inventing a second secret — and there
// is no password to forget.
app.get('/api/manage', (req, res) => {
  const sub = findByToken(String(req.query.token ?? ''))
  if (!sub) return res.status(404).type('html').send(landingPage('invalid', 'en', SITE_URL))
  res
    .type('html')
    .send(managePage({ sub, lang: sub.lang, siteUrl: SITE_URL, categories: catalog.categories }))
})

app.post('/api/manage', (req, res) => {
  const token = String(req.body?.token ?? '')
  const sub = findByToken(token)
  if (!sub) return res.status(404).type('html').send(landingPage('invalid', 'en', SITE_URL))

  // A single checked box arrives as a string, several as an array, none as
  // undefined — normalise all three before validating.
  const asArray = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v])

  const categories = asArray(req.body.categories)
    .map(String)
    .filter((c) => CATEGORIES.has(c))

  const leadDays = [
    ...new Set(
      asArray(req.body.leadDays)
        .map(Number)
        .filter((n) => Number.isInteger(n) && n >= 0 && n <= 60),
    ),
  ]

  // Clearing every lead time would silently mean "never remind me", which
  // nobody intends on a page they opened to adjust reminders.
  const updated = updatePreferences(token, {
    categories,
    leadDays: leadDays.length > 0 ? leadDays : sub.leadDays,
  })

  res.type('html').send(
    managePage({
      sub: updated,
      lang: updated.lang,
      siteUrl: SITE_URL,
      categories: catalog.categories,
      saved: true,
    }),
  )
})

// ── the daily job ───────────────────────────────────────────────────────

/**
 * Send every reminder due on `today`, skipping anything already delivered.
 *
 * Exported so `run-reminders.js` can invoke it by hand for any date without
 * waiting for the scheduler.
 */
export async function runReminders(today = todayISO(new Date(), TZ), { dryRun = false } = {}) {
  const alreadySent = sentKeys()
  const summary = { today, subscribers: 0, emails: 0, reminders: 0 }

  for (const sub of confirmedSubscriptions()) {
    summary.subscribers += 1

    const due = dueReminders(catalog, today, sub).filter(
      (d) => !alreadySent.has(sentKey(sub.id, d.event.id, d.occurrence.start, d.lead)),
    )
    if (due.length === 0) continue

    const items = due.map((d) => ({
      name: d.event.name[sub.lang] ?? d.event.name.en,
      lead: d.lead,
      start: d.occurrence.start,
      end: d.occurrence.end,
      confirmed: d.occurrence.confirmed,
    }))

    const token = encodeURIComponent(sub.unsubscribeToken)
    const mail = reminderEmail({
      lang: sub.lang,
      items,
      siteUrl: SITE_URL,
      unsubscribeUrl: `${SITE_URL}/api/unsubscribe?token=${token}`,
      manageUrl: `${SITE_URL}/api/manage?token=${token}`,
    })

    if (dryRun) {
      console.log(`[reminders] would send to ${sub.email}: ${mail.subject}`)
    } else {
      try {
        await sendMail({ to: sub.email, ...mail })
      } catch (err) {
        // One bad address must not stop everyone else's reminders. The keys
        // stay unmarked, so tomorrow's run retries.
        console.error(`[reminders] send to ${sub.email} failed:`, err.message)
        continue
      }
      markSent(due.map((d) => sentKey(sub.id, d.event.id, d.occurrence.start, d.lead)))
    }

    summary.emails += 1
    summary.reminders += due.length
  }

  console.log('[reminders]', JSON.stringify(summary))
  return summary
}

// Only start listening when run directly, so importing this module for a
// one-off reminder run does not also bind the port. Compared as real paths,
// not as strings: import.meta.url percent-encodes spaces, so a repo living
// under a directory like "AI Projects" never matches argv[1] textually.
const isMain =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isMain) {
  new Cron(REMINDER_CRON, { timezone: TZ }, () => {
    runReminders().catch((err) => console.error('[reminders] run failed:', err))
  })
  console.log(`[scheduler] reminders at "${REMINDER_CRON}" (${TZ})`)

  app.listen(PORT, () => console.log(`[server] listening on :${PORT}`))
}

export { app, catalog }
