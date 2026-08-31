/**
 * Emit the dataset, with every date already resolved, for the notification
 * backend to read.
 *
 * The backend deliberately does NOT re-implement the recurrence rules. Two
 * copies of "Black Friday is the day after the 4th Thursday of November"
 * would drift the moment one is fixed and the other is not, and the whole
 * point of this project is that the dates are right. So this script runs
 * the real engine and writes the answers to disk; Python only ever reads.
 *
 * Regenerated on every Docker build, so a dataset edit reaches the emails
 * on the next deploy.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EVENTS } from '../src/data/events'
import { occurrenceFor, toISO } from '../src/lib/dates'
import { CATEGORIES } from '../src/data/categories'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../backend/catalog/events.json')

/** One year back so a period still running is present, three ahead so the
 *  scheduler never runs out of runway between deploys. */
const YEARS_BACK = 1
const YEARS_AHEAD = 3

const thisYear = new Date().getFullYear()
const years: number[] = []
for (let y = thisYear - YEARS_BACK; y <= thisYear + YEARS_AHEAD; y++) years.push(y)

// Shipped so the backend can label a category in the subscriber's language
// without keeping its own translated copy of the list.
const categories = CATEGORIES.map((c) => ({ id: c.id, name: c.name }))

const events = EVENTS.map((e) => ({
  id: e.id,
  name: e.name,
  blurb: e.blurb,
  region: e.region ?? null,
  countries: e.countries,
  categories: e.categories,
  season: e.season,
  precision: e.precision,
  sources: e.sources,
}))

const seen = new Set<string>()
const occurrences = []
for (const event of EVENTS) {
  for (const year of years) {
    const o = occurrenceFor(event, year)
    // A period crossing a year boundary resolves identically from either
    // side; keep one copy.
    const key = `${event.id}@${toISO(o.start)}`
    if (seen.has(key)) continue
    seen.add(key)
    occurrences.push({
      eventId: event.id,
      start: toISO(o.start),
      end: toISO(o.end),
      confirmed: o.confirmed,
    })
  }
}

occurrences.sort((a, b) => a.start.localeCompare(b.start))

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(
  OUT,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), years, categories, events, occurrences },
    null,
    2,
  ) + '\n',
)

console.log(
  `[export-events] ${events.length} events, ${occurrences.length} occurrences ` +
    `(${years[0]}–${years[years.length - 1]}) -> ${OUT}`,
)
