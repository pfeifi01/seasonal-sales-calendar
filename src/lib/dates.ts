import type { AnchoredRule, DateRule, Occurrence, SaleEvent } from '../types'

/** Local midnight, so day arithmetic never trips over timezones or DST. */
export function day(year: number, month: number, date: number): Date {
  return new Date(year, month - 1, date)
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dd}`
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return day(y, m, d)
}

/** Whole days from `a` to `b`, both snapped to local midnight first. */
export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime()
  return Math.round(ms / 86_400_000)
}

/**
 * Easter Sunday by the anonymous Gregorian algorithm. Needed because two
 * real events hang off it: German Vatertag is Ascension Day (Easter + 39),
 * and Easter-week promotions move with it every year.
 */
export function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const date = ((h + l - 7 * m + 114) % 31) + 1
  return day(year, month, date)
}

/**
 * The nth `weekday` of a month. `nth: 1` is the first one, `nth: -1` the
 * last. Counting from the end matters for rules like "the last Monday in
 * July", which is not the same as "the 4th Monday" in every year.
 */
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number,
): Date {
  if (nth > 0) {
    const first = day(year, month, 1)
    const shift = (weekday - first.getDay() + 7) % 7
    return day(year, month, 1 + shift + (nth - 1) * 7)
  }
  // Walk back from the last day of the month.
  const last = day(year, month + 1, 0)
  const shift = (last.getDay() - weekday + 7) % 7
  return addDays(last, -shift - (-nth - 1) * 7)
}

export function resolveRule(rule: DateRule, year: number): Date {
  switch (rule.kind) {
    case 'fixed':
      return day(year, rule.month, rule.day)
    case 'nthWeekday':
      return nthWeekdayOfMonth(year, rule.month, rule.weekday, rule.nth)
    case 'easter':
      return addDays(easterSunday(year), rule.offsetDays)
  }
}

export function resolveAnchored(anchored: AnchoredRule, year: number): Date {
  return addDays(resolveRule(anchored.rule, year), anchored.offsetDays ?? 0)
}

/**
 * Resolve one event to real dates for one year. Confirmed official dates in
 * `overrides` always win — the rules are only a best-effort guess at what a
 * year nobody has published yet will look like.
 */
export function occurrenceFor(event: SaleEvent, year: number): Occurrence {
  const override = event.overrides?.[year]
  if (override) {
    return {
      event,
      start: fromISO(override.start),
      end: fromISO(override.end),
      confirmed: true,
    }
  }

  const start = resolveAnchored(event.start, year)
  const end =
    'durationDays' in event.end
      ? addDays(start, event.end.durationDays - 1)
      : resolveAnchored(event.end, year)

  return { event, start, end, confirmed: false }
}

/**
 * Every occurrence that touches `year`, sorted by start date.
 *
 * Events are also resolved for the previous year, because a period like the
 * post-Christmas sales starts on 27 December and runs into January — asking
 * only for this year's rule would drop it from January's calendar.
 */
export function occurrencesInYear(events: SaleEvent[], year: number): Occurrence[] {
  const yearStart = day(year, 1, 1)
  const yearEnd = day(year, 12, 31)

  return events
    .flatMap((event) => [occurrenceFor(event, year - 1), occurrenceFor(event, year)])
    .filter((o) => o.end >= yearStart && o.start <= yearEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

/** Occurrences that have not finished yet, nearest first. */
export function upcomingFrom(
  events: SaleEvent[],
  from: Date,
  monthsAhead = 18,
): Occurrence[] {
  const horizon = new Date(from)
  horizon.setMonth(horizon.getMonth() + monthsAhead)
  const year = from.getFullYear()

  return [year, year + 1, year + 2]
    .flatMap((y) => events.map((e) => occurrenceFor(e, y)))
    .filter((o) => o.end >= startOfDay(from) && o.start <= horizon)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

export function isActiveOn(o: Occurrence, d: Date): boolean {
  const t = startOfDay(d).getTime()
  return t >= o.start.getTime() && t <= o.end.getTime()
}

/** Negative once the sale has started; 0 means it starts today. */
export function daysUntilStart(o: Occurrence, from: Date): number {
  return daysBetween(from, o.start)
}
