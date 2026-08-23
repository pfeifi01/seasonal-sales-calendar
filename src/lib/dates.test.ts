import { describe, expect, it } from 'vitest'
import {
  addDays,
  daysBetween,
  easterSunday,
  nthWeekdayOfMonth,
  occurrenceFor,
  occurrencesInYear,
  toISO,
} from './dates'
import { EVENTS } from '../data/events'
import type { SaleEvent } from '../types'

function eventById(id: string): SaleEvent {
  const found = EVENTS.find((e) => e.id === id)
  if (!found) throw new Error(`no such event: ${id}`)
  return found
}

describe('easterSunday', () => {
  // Known Gregorian Easter dates — the algorithm is easy to get subtly wrong,
  // so pin several years including a March one and a late-April one.
  it.each([
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2028, '2028-04-16'],
    [2030, '2030-04-21'],
  ])('resolves %i', (year, expected) => {
    expect(toISO(easterSunday(year))).toBe(expected)
  })
})

describe('nthWeekdayOfMonth', () => {
  it('finds the first Saturday of July 2026', () => {
    expect(toISO(nthWeekdayOfMonth(2026, 7, 6, 1))).toBe('2026-07-04')
  })

  it('finds the 4th Thursday of November 2026', () => {
    expect(toISO(nthWeekdayOfMonth(2026, 11, 4, 4))).toBe('2026-11-26')
  })

  it('counts backwards for the last Monday of July 2026', () => {
    expect(toISO(nthWeekdayOfMonth(2026, 7, 1, -1))).toBe('2026-07-27')
  })

  it('distinguishes the last Monday from the 4th in a 5-Monday month', () => {
    // December 2025 has Mondays on 1, 8, 15, 22 and 29.
    expect(toISO(nthWeekdayOfMonth(2025, 12, 1, 4))).toBe('2025-12-22')
    expect(toISO(nthWeekdayOfMonth(2025, 12, 1, -1))).toBe('2025-12-29')
  })
})

describe('black friday', () => {
  // The day after US Thanksgiving, NOT simply "the 4th Friday of November" —
  // those disagree in any year where 1 November falls on a Friday.
  it.each([
    [2025, '2025-11-28'],
    [2026, '2026-11-27'],
    [2027, '2027-11-26'],
    [2028, '2028-11-24'],
  ])('resolves %i', (year, expected) => {
    const o = occurrenceFor(eventById('black-friday'), year)
    expect(toISO(o.start)).toBe(expected)
  })

  it('disagrees with the naive 4th-Friday rule when 1 Nov is a Friday', () => {
    // 1 November 2030 is a Friday: 4th Friday = 22 Nov, real Black Friday = 29 Nov.
    expect(toISO(nthWeekdayOfMonth(2030, 11, 5, 4))).toBe('2030-11-22')
    expect(toISO(occurrenceFor(eventById('black-friday'), 2030).start)).toBe('2030-11-29')
  })
})

describe('confirmed overrides', () => {
  it('uses the published South Tyrol winter dates for 2026', () => {
    const o = occurrenceFor(eventById('it-southtyrol-winter'), 2026)
    expect(toISO(o.start)).toBe('2026-01-08')
    expect(toISO(o.end)).toBe('2026-02-05')
    expect(o.confirmed).toBe(true)
  })

  it('falls back to the rule for a year with no published dates', () => {
    const o = occurrenceFor(eventById('it-southtyrol-winter'), 2029)
    expect(o.confirmed).toBe(false)
  })

  it('uses the published national Italian summer date for 2026', () => {
    const o = occurrenceFor(eventById('it-saldi-estivi'), 2026)
    expect(toISO(o.start)).toBe('2026-07-04')
    expect(o.confirmed).toBe(true)
  })
})

describe('occurrencesInYear', () => {
  it('includes a period that started in the previous December', () => {
    const postXmas = eventById('post-christmas-sales')
    const inYear = occurrencesInYear([postXmas], 2026)
    // The run starting 27 Dec 2025 spills into January 2026, so both the
    // previous year's and this year's occurrence must be present.
    expect(inYear).toHaveLength(2)
    expect(toISO(inYear[0].start)).toBe('2025-12-27')
  })

  it('returns occurrences sorted by start date', () => {
    const all = occurrencesInYear(EVENTS, 2026)
    const starts = all.map((o) => o.start.getTime())
    expect(starts).toEqual([...starts].sort((a, b) => a - b))
  })

  it('never produces an end before its start', () => {
    for (const year of [2025, 2026, 2027, 2028]) {
      for (const o of occurrencesInYear(EVENTS, year)) {
        expect(
          o.end.getTime(),
          `${o.event.id} in ${year} ends before it starts`,
        ).toBeGreaterThanOrEqual(o.start.getTime())
      }
    }
  })
})

describe('day arithmetic', () => {
  it('counts days across a DST boundary', () => {
    // Central European DST starts on 29 March 2026; a naive ms/86400000
    // division would return 0.958… days here and floor to the wrong value.
    expect(daysBetween(new Date(2026, 2, 28), new Date(2026, 2, 30))).toBe(2)
  })

  it('addDays crosses month and year boundaries', () => {
    expect(toISO(addDays(new Date(2026, 11, 30), 5))).toBe('2027-01-04')
  })
})

describe('dataset integrity', () => {
  it('has unique ids', () => {
    const ids = EVENTS.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every event at least one country, category and source', () => {
    for (const e of EVENTS) {
      expect(e.countries.length, `${e.id} has no country`).toBeGreaterThan(0)
      expect(e.categories.length, `${e.id} has no category`).toBeGreaterThan(0)
      expect(e.sources.length, `${e.id} has no source`).toBeGreaterThan(0)
    }
  })

  it('translates every name and blurb into all three languages', () => {
    for (const e of EVENTS) {
      for (const lang of ['en', 'de', 'it'] as const) {
        expect(e.name[lang]?.length, `${e.id} name.${lang}`).toBeGreaterThan(0)
        expect(e.blurb[lang]?.length, `${e.id} blurb.${lang}`).toBeGreaterThan(0)
      }
    }
  })

  it('only marks an event regulated when it cites a source', () => {
    for (const e of EVENTS.filter((x) => x.precision === 'regulated')) {
      expect(e.sources.length, `${e.id} claims to be regulated`).toBeGreaterThan(0)
    }
  })
})
