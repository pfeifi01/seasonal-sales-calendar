import { describe, expect, it } from 'vitest'
import { loadCatalog } from './catalog.js'
import {
  addDaysISO,
  dueReminders,
  matchesSubscription,
  sentKey,
  todayISO,
} from './reminders.js'

const catalog = loadCatalog()

function sub(overrides = {}) {
  return {
    id: 'sub1',
    country: 'AT',
    categories: [],
    leadDays: [7, 1],
    ...overrides,
  }
}

describe('addDaysISO', () => {
  it('crosses a month boundary', () => {
    expect(addDaysISO('2026-01-30', 3)).toBe('2026-02-02')
  })

  it('crosses a year boundary', () => {
    expect(addDaysISO('2026-12-30', 5)).toBe('2027-01-04')
  })

  it('is unaffected by the CET DST change', () => {
    // Clocks go forward on 29 March 2026; a local-time implementation can
    // land on the wrong day here.
    expect(addDaysISO('2026-03-28', 2)).toBe('2026-03-30')
  })

  it('handles a leap day', () => {
    expect(addDaysISO('2028-02-28', 1)).toBe('2028-02-29')
  })
})

describe('todayISO', () => {
  it('formats as YYYY-MM-DD in the configured zone', () => {
    // 23:30 UTC on 5 Jan is already 6 Jan in Vienna.
    const at = new Date('2026-01-05T23:30:00Z')
    expect(todayISO(at, 'Europe/Vienna')).toBe('2026-01-06')
    expect(todayISO(at, 'UTC')).toBe('2026-01-05')
  })
})

describe('matchesSubscription', () => {
  const blackFriday = catalog.events.get('black-friday')
  const southTyrol = catalog.events.get('it-southtyrol-winter')

  it('keeps an event available in the subscriber country', () => {
    expect(matchesSubscription(blackFriday, sub({ country: 'AT' }))).toBe(true)
  })

  it('drops an event from another country', () => {
    expect(matchesSubscription(southTyrol, sub({ country: 'AT' }))).toBe(false)
    expect(matchesSubscription(southTyrol, sub({ country: 'IT' }))).toBe(true)
  })

  it('treats an empty category list as everything', () => {
    expect(matchesSubscription(blackFriday, sub({ categories: [] }))).toBe(true)
  })

  it('filters by category when one is chosen', () => {
    expect(matchesSubscription(blackFriday, sub({ categories: ['electronics'] }))).toBe(true)
    expect(matchesSubscription(blackFriday, sub({ categories: ['travel'] }))).toBe(false)
  })
})

describe('dueReminders', () => {
  it('finds Black Friday 2026 exactly 7 days out', () => {
    // Black Friday 2026 is 27 November.
    const due = dueReminders(catalog, '2026-11-20', sub())
    expect(due.map((d) => d.event.id)).toContain('black-friday')
    expect(due.find((d) => d.event.id === 'black-friday').lead).toBe(7)
  })

  it('finds it again the day before', () => {
    const due = dueReminders(catalog, '2026-11-26', sub())
    expect(due.find((d) => d.event.id === 'black-friday').lead).toBe(1)
  })

  it('returns nothing on a day with no sale starting at a lead distance', () => {
    expect(dueReminders(catalog, '2026-05-20', sub())).toEqual([])
  })

  it('respects a custom lead time', () => {
    const due = dueReminders(catalog, '2026-11-13', sub({ leadDays: [14] }))
    expect(due.map((d) => d.event.id)).toContain('black-friday')
  })

  it('announces the confirmed South Tyrol winter sale to an Italian subscriber', () => {
    // Published start is 8 January 2026.
    const due = dueReminders(catalog, '2026-01-01', sub({ country: 'IT' }))
    const hit = due.find((d) => d.event.id === 'it-southtyrol-winter')
    expect(hit).toBeDefined()
    expect(hit.lead).toBe(7)
    expect(hit.occurrence.confirmed).toBe(true)
  })

  it('does not send that same sale to an Austrian subscriber', () => {
    const due = dueReminders(catalog, '2026-01-01', sub({ country: 'AT' }))
    expect(due.map((d) => d.event.id)).not.toContain('it-southtyrol-winter')
  })

  it('orders the nearest start first', () => {
    const due = dueReminders(catalog, '2026-11-20', sub({ leadDays: [7, 1] }))
    const leads = due.map((d) => d.lead)
    expect(leads).toEqual([...leads].sort((a, b) => a - b))
  })

  it('never repeats an event within one run', () => {
    const due = dueReminders(catalog, '2026-11-20', sub({ leadDays: [7, 7, 7] }))
    const ids = due.map((d) => d.event.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('sentKey', () => {
  it('separates the same event at different lead times', () => {
    expect(sentKey('s1', 'black-friday', '2026-11-27', 7)).not.toBe(
      sentKey('s1', 'black-friday', '2026-11-27', 1),
    )
  })

  it('separates the same sale in different years', () => {
    expect(sentKey('s1', 'black-friday', '2026-11-27', 7)).not.toBe(
      sentKey('s1', 'black-friday', '2027-11-26', 7),
    )
  })
})
