import { useMemo } from 'react'
import { CATEGORY_BY_ID } from '../data/categories'
import { addDays, daysBetween, startOfDay } from '../lib/dates'
import { weekdayShortNames } from '../lib/format'
import { loc, makeTranslator } from '../i18n'
import type { Lang, Occurrence } from '../types'

interface Props {
  lang: Lang
  year: number
  month: number
  occurrences: Occurrence[]
  today: Date
  onSelect: (o: Occurrence) => void
}

const MAX_LANES = 3

interface Bar {
  o: Occurrence
  /** Column 0–6 within the week. */
  col: number
  span: number
  lane: number
  continuesLeft: boolean
  continuesRight: boolean
}

/** Monday on or before `d` — all four countries start the week on Monday. */
function mondayOnOrBefore(d: Date): Date {
  const shift = (d.getDay() + 6) % 7
  return addDays(startOfDay(d), -shift)
}

/**
 * Pack a week's overlapping periods into horizontal lanes, first-fit. This
 * is what makes a multi-day sale read as one continuous bar across the week
 * instead of a dot repeated in seven cells.
 */
function packWeek(weekStart: Date, occurrences: Occurrence[]): Bar[] {
  const weekEnd = addDays(weekStart, 6)

  const touching = occurrences
    .filter((o) => o.end >= weekStart && o.start <= weekEnd)
    .sort(
      (a, b) =>
        a.start.getTime() - b.start.getTime() ||
        b.end.getTime() - a.end.getTime(),
    )

  // laneEnds[lane] = last column occupied in that lane so far.
  const laneEnds: number[] = []
  const bars: Bar[] = []

  for (const o of touching) {
    const col = Math.max(0, daysBetween(weekStart, o.start))
    const endCol = Math.min(6, daysBetween(weekStart, o.end))
    const span = endCol - col + 1

    let lane = laneEnds.findIndex((end) => end < col)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(endCol)
    } else {
      laneEnds[lane] = endCol
    }

    bars.push({
      o,
      col,
      span,
      lane,
      continuesLeft: o.start < weekStart,
      continuesRight: o.end > weekEnd,
    })
  }

  return bars
}

export default function MonthGrid({
  lang,
  year,
  month,
  occurrences,
  today,
  onSelect,
}: Props) {
  const t = makeTranslator(lang)
  const weekdays = weekdayShortNames(lang)

  const weeks = useMemo(() => {
    const first = new Date(year, month, 1)
    const gridStart = mondayOnOrBefore(first)
    const lastOfMonth = new Date(year, month + 1, 0)
    // Enough weeks to cover the month — 4 to 6 depending on where it falls.
    const weekCount = Math.ceil((daysBetween(gridStart, lastOfMonth) + 1) / 7)

    return Array.from({ length: weekCount }, (_, w) => {
      const weekStart = addDays(gridStart, w * 7)
      return { weekStart, bars: packWeek(weekStart, occurrences) }
    })
  }, [year, month, occurrences])

  const todayTime = startOfDay(today).getTime()

  return (
    <div className="panel overflow-hidden">
      <div className="grid grid-cols-7 border-b border-white/[0.06]">
        {weekdays.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-500"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        {weeks.map(({ weekStart, bars }) => {
          const lanesUsed = Math.min(
            MAX_LANES,
            bars.reduce((max, b) => Math.max(max, b.lane + 1), 0),
          )
          const hidden = bars.filter((b) => b.lane >= MAX_LANES)

          return (
            <div key={weekStart.getTime()} className="border-b border-white/[0.05] last:border-0">
              {/* Day numbers */}
              <div className="grid grid-cols-7">
                {Array.from({ length: 7 }, (_, i) => {
                  const d = addDays(weekStart, i)
                  const inMonth = d.getMonth() === month
                  const isToday = startOfDay(d).getTime() === todayTime
                  return (
                    <div key={i} className="px-2 pt-2 text-right">
                      <span
                        className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-medium ${
                          isToday
                            ? 'bg-tag-500 font-bold text-ink-950'
                            : inMonth
                              ? 'text-ink-200'
                              : 'text-ink-600'
                        }`}
                      >
                        {d.getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Event bars */}
              <div
                className="relative mt-1 px-1"
                style={{ height: `${Math.max(lanesUsed, 1) * 26 + 8}px` }}
              >
                {bars
                  .filter((b) => b.lane < MAX_LANES)
                  .map((b) => {
                    const color = CATEGORY_BY_ID[b.o.event.categories[0]].color
                    return (
                      <button
                        key={`${b.o.event.id}-${b.o.start.getTime()}`}
                        onClick={() => onSelect(b.o)}
                        title={loc(b.o.event.name, lang)}
                        className={`absolute flex h-[22px] items-center overflow-hidden border px-2
                                    text-left text-[11px] font-medium text-white/90
                                    transition-all hover:brightness-125 ${
                                      b.continuesLeft ? 'rounded-l-none' : 'rounded-l-full'
                                    } ${b.continuesRight ? 'rounded-r-none' : 'rounded-r-full'}`}
                        style={{
                          left: `calc(${(b.col / 7) * 100}% + 2px)`,
                          width: `calc(${(b.span / 7) * 100}% - 4px)`,
                          top: `${b.lane * 26}px`,
                          backgroundColor: `${color}3d`,
                          borderColor: `${color}99`,
                        }}
                      >
                        <span className="truncate">{loc(b.o.event.name, lang)}</span>
                      </button>
                    )
                  })}

                {hidden.length > 0 && (
                  <span className="absolute bottom-0 right-2 text-[10px] font-medium text-ink-500">
                    +{hidden.length}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {occurrences.length === 0 && (
        <p className="p-8 text-center text-ink-400">{t('filter.none')}</p>
      )}
    </div>
  )
}
