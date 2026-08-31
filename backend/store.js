import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Subscription storage.
 *
 * Plain JSON files on a mounted volume, like the other sites on this NAS --
 * there is no database and at this scale there does not need to be. Writes
 * land atomically via a temp file plus rename, so a crash mid-write cannot
 * leave a truncated subscriber list behind.
 */

const HERE = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(HERE, 'data')
const SUBS_FILE = join(DATA_DIR, 'subscriptions.json')
const SENT_FILE = join(DATA_DIR, 'sent.json')

/** How many delivered-reminder keys to retain. A key embeds the year, so an
 *  old one can never match again; this only bounds the file. */
const SENT_HISTORY = 5000

function token(bytes = 24) {
  return randomBytes(bytes).toString('base64url')
}

function nowISO() {
  return new Date().toISOString()
}

function read(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    // Missing on first run, or unreadable. Either way, start from empty
    // rather than crashing the server on boot.
    return fallback
  }
}

function write(path, value) {
  mkdirSync(DATA_DIR, { recursive: true })
  const tmp = `${path}.tmp`
  writeFileSync(tmp, JSON.stringify(value, null, 2))
  renameSync(tmp, path)
}

export function allSubscriptions() {
  return read(SUBS_FILE, [])
}

export function confirmedSubscriptions() {
  return allSubscriptions().filter((s) => s.confirmed)
}

/**
 * Create a pending subscription, or refresh the one already there.
 *
 * Re-subscribing an existing address is not an error and does not create a
 * duplicate: it updates the preferences and issues a fresh confirmation
 * token. An address that was already confirmed stays confirmed, so changing
 * preferences does not silently switch reminders off.
 */
export function upsertSubscription({ email, country, lang, categories, leadDays }) {
  const subs = allSubscriptions()
  const existing = subs.find((s) => s.email === email)

  if (existing) {
    Object.assign(existing, {
      country,
      lang,
      categories,
      leadDays,
      updatedAt: nowISO(),
    })
    if (!existing.confirmed) existing.confirmToken = token()
    write(SUBS_FILE, subs)
    return existing
  }

  const sub = {
    id: token(9),
    email,
    country,
    lang,
    categories,
    leadDays,
    confirmed: false,
    confirmToken: token(),
    unsubscribeToken: token(),
    createdAt: nowISO(),
    confirmedAt: null,
  }
  subs.push(sub)
  write(SUBS_FILE, subs)
  return sub
}

export function confirmSubscription(confirmToken) {
  const subs = allSubscriptions()
  const sub = subs.find((s) => s.confirmToken && s.confirmToken === confirmToken)
  if (!sub) return null
  sub.confirmed = true
  sub.confirmedAt = nowISO()
  // Burn the token so a forwarded confirmation link cannot be replayed.
  sub.confirmToken = null
  write(SUBS_FILE, subs)
  return sub
}

export function removeSubscription(unsubscribeToken) {
  const subs = allSubscriptions()
  const sub = subs.find((s) => s.unsubscribeToken === unsubscribeToken)
  if (!sub) return null
  write(
    SUBS_FILE,
    subs.filter((s) => s.id !== sub.id),
  )
  return sub
}

export function sentKeys() {
  return new Set(read(SENT_FILE, []))
}

export function markSent(keys) {
  if (keys.length === 0) return
  const existing = read(SENT_FILE, [])
  const merged = [...new Set([...existing, ...keys])]
  write(SENT_FILE, merged.slice(-SENT_HISTORY))
}
