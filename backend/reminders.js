/**
 * Deciding which reminders are due today.
 *
 * Deliberately free of I/O and of any dependency, so the whole rule is
 * covered by unit tests from the repo root without a server, a mailbox or a
 * clock. `server.js` supplies the date and the subscriptions.
 */

/** ISO `YYYY-MM-DD` plus n days, done in UTC so a DST change cannot shift it. */
export function addDaysISO(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d) + n * 86_400_000
  return new Date(t).toISOString().slice(0, 10)
}

export function todayISO(now = new Date(), timeZone = 'Europe/Vienna') {
  // en-CA formats as YYYY-MM-DD, which is exactly the shape we store.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Does this event belong in a given subscriber's reminders? */
export function matchesSubscription(event, { country, categories }) {
  if (!event.countries.includes(country)) return false
  // An empty category list means "everything" -- the default, so the signup
  // form works without forcing nine checkboxes on anyone.
  if (categories?.length && !categories.some((c) => event.categories.includes(c))) {
    return false
  }
  return true
}

/** Stable identity for one reminder, so a restart cannot send it twice. */
export function sentKey(subscriptionId, eventId, start, lead) {
  return `${subscriptionId}|${eventId}|${start}|${lead}`
}

/**
 * Which reminders a subscriber should receive today.
 *
 * With the default lead times of [7, 1] a sale is announced a week out and
 * again the day before. Longer leads are listed first so the email reads in
 * the order things will happen.
 */
export function dueReminders(catalog, today, subscription) {
  const leads = [...new Set(subscription.leadDays)].sort((a, b) => b - a)
  const due = []

  for (const lead of leads) {
    const target = addDaysISO(today, lead)
    for (const occ of catalog.occurrences) {
      if (occ.start !== target) continue
      const event = catalog.events.get(occ.eventId)
      if (!event || !matchesSubscription(event, subscription)) continue
      due.push({ lead, occurrence: occ, event })
    }
  }

  // Nearest start first, so "starts tomorrow" leads the email.
  return due.sort((a, b) => a.lead - b.lead)
}
