import { useMemo } from 'react'
import { CATEGORY_BY_ID } from '../data/categories'
import { day, daysBetween } from '../lib/dates'
import { formatRange, monthShortNames } from '../lib/format'
import { loc, makeTranslator } from '../i18n'
import type { Lang, Occurrence } from '../types'

interface Props {
  lang: Lang
  year: number
  occurrences: Occurrence[]
  today: Date
  onSelect: (o: Occurrence) => void
}

/** Position of a date within `year`, as a 0–100 percentage. Dates outside
 *  the year clamp to the edges so periods spilling over a year boundary
 *  render as a bar running off the end rather than disappearing. */
function pct(d: Date, year: number): number {
  const start = day(year, 1, 1)
  const length = daysBetween(start, day(year + 1, 1, 1))
  const offset = daysBetween(start, d)
  return Math.min(100, Math.max(0, (offset / length) * 100))
}

export default function YearTimeline({ lang, year, occurrences, today, onSelect }: Props) {
  const months = monthShortNames(lang)
  const t = makeTranslator(lang)

  // One row per event, even when it occurs twice inside the same calendar
  // year (a period starting in December shows up at both edges).
  const rows = useMemo(() => {
    const byEvent = new Map<string, Occurrence[]>()
    for (const o of occurrences) {
      const list = byEvent.get(o.event.id)
      if (list) list.push(o)
      else byEvent.set(o.event.id, [o])
    }
    return [...byEvent.values()].sort((a, b) => a[0].start.getTime() - b[0].start.getTime())
  }, [occurrences])

  const showToday = today.getFullYear() === year
  const todayPct = showToday ? pct(today, year) : 0

  if (rows.length === 0) {
    return <p className="panel p-8 text-center text-ink-400">{t('filter.none')}</p>
  }

  return (
    <div className="panel overflow-x-auto">
      <div className="min-w-[46rem] p-4 sm:p-5">
        {/* Month scale */}
        <div className="flex">
          <div className="w-44 shrink-0 sm:w-52" />
          <div className="relative flex-1">
            <div className="grid grid-cols-12">
              {months.map((m, i) => (
                <div
                  key={m}
                  className={`border-l py-1 pl-1.5 text-[11px] font-semibold uppercase tracking-wide ${
                    showToday && today.getMonth() === i
                      ? 'border-tag-400/40 text-tag-300'
                      : 'border-white/[0.07] text-ink-500'
                  }`}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="relative mt-1">
          <div className="flex flex-col gap-1">
            {rows.map((group) => {
              const event = group[0].event
              const color = CATEGORY_BY_ID[event.categories[0]].color
              return (
                <div key={event.id} className="group flex items-center">
                  <div className="w-44 shrink-0 pr-3 sm:w-52">
                    <p className="truncate text-sm font-medium text-ink-200 group-hover:text-white">
                      {loc(event.name, lang)}
                    </p>
                    {event.region && (
                      <p className="truncate text-[11px] text-ink-500">
                        {loc(event.region, lang)}
                      </p>
                    )}
                  </div>

                  <div className="relative h-9 flex-1 rounded-md">
                    {/* month gridlines */}
                    <div aria-hidden="true" className="absolute inset-0 grid grid-cols-12">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="border-l border-white/[0.05]" />
                      ))}
                    </div>

                    {showToday && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-y-0 z-10 w-px bg-tag-400/50"
                        style={{ left: `${todayPct}%` }}
                      />
                    )}

                    {group.map((o) => {
                      const left = pct(o.start, year)
                      const right = pct(o.end, year)
                      const width = Math.max(right - left, 0.7)
                      return (
                        <button
                          key={o.start.getTime()}
                          onClick={() => onSelect(o)}
                          title={`${loc(event.name, lang)} · ${formatRange(o, lang)}`}
                          className="absolute top-1/2 z-20 h-5 -translate-y-1/2 rounded-full
                                     border transition-all duration-150
                                     hover:h-6 hover:brightness-125 focus-visible:h-6"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: `${color}44`,
                            borderColor: `${color}aa`,
                          }}
                        >
                          <span className="sr-only">
                            {loc(event.name, lang)} — {formatRange(o, lang)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
