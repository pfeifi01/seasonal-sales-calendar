import type { Lang, Occurrence } from '../types'
import { daysBetween } from './dates'

const LOCALE: Record<Lang, string> = { en: 'en-GB', de: 'de-AT', it: 'it-IT' }

export function formatDate(d: Date, lang: Lang, opts?: Intl.DateTimeFormatOptions): string {
  return d.toLocaleDateString(LOCALE[lang], opts ?? { day: 'numeric', month: 'short' })
}

export function formatFullDate(d: Date, lang: Lang): string {
  return d.toLocaleDateString(LOCALE[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatMonth(year: number, month: number, lang: Lang): string {
  return new Date(year, month, 1).toLocaleDateString(LOCALE[lang], {
    month: 'long',
    year: 'numeric',
  })
}

export function monthShortNames(lang: Lang): string[] {
  return Array.from({ length: 12 }, (_, m) =>
    new Date(2026, m, 1).toLocaleDateString(LOCALE[lang], { month: 'short' }),
  )
}

/** Weekday initials starting on Monday, which is the week start in all four countries. */
export function weekdayShortNames(lang: Lang): string[] {
  // 2026-01-05 is a Monday.
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2026, 0, 5 + i).toLocaleDateString(LOCALE[lang], { weekday: 'short' }),
  )
}

/** "3 – 9 Jan" or "27 Dec – 7 Jan", collapsing to one date for single days. */
export function formatRange(o: Occurrence, lang: Lang): string {
  const sameDay = o.start.getTime() === o.end.getTime()
  if (sameDay) return formatDate(o.start, lang)

  const sameMonth =
    o.start.getMonth() === o.end.getMonth() && o.start.getFullYear() === o.end.getFullYear()

  const from = sameMonth
    ? o.start.toLocaleDateString(LOCALE[lang], { day: 'numeric' })
    : formatDate(o.start, lang)

  return `${from} – ${formatDate(o.end, lang)}`
}

export function durationDays(o: Occurrence): number {
  return daysBetween(o.start, o.end) + 1
}
