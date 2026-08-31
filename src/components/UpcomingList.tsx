import { CATEGORY_BY_ID } from '../data/categories'
import { COUNTRY_BY_CODE } from '../data/countries'
import { daysBetween, daysUntilStart, isActiveOn } from '../lib/dates'
import { durationDays, formatRange } from '../lib/format'
import { loc, makeTranslator } from '../i18n'
import type { Lang, Occurrence } from '../types'
import PrecisionBadge from './PrecisionBadge'

interface Props {
  lang: Lang
  occurrences: Occurrence[]
  today: Date
  onSelect: (o: Occurrence) => void
}

export default function UpcomingList({ lang, occurrences, today, onSelect }: Props) {
  const t = makeTranslator(lang)

  if (occurrences.length === 0) {
    return <p className="panel p-8 text-center text-ink-400">{t('list.empty')}</p>
  }

  const active = occurrences.filter((o) => isActiveOn(o, today))
  const upcoming = occurrences.filter((o) => !isActiveOn(o, today))

  return (
    <div className="flex flex-col gap-6">
      {active.length > 0 && (
        <Group title={t('list.active')}>
          {active.map((o) => (
            <Row
              key={`${o.event.id}-${o.start.getTime()}`}
              o={o}
              lang={lang}
              today={today}
              onSelect={onSelect}
            />
          ))}
        </Group>
      )}
      {upcoming.length > 0 && (
        <Group title={t('list.upcoming')}>
          {upcoming.map((o) => (
            <Row
              key={`${o.event.id}-${o.start.getTime()}`}
              o={o}
              lang={lang}
              today={today}
              onSelect={onSelect}
            />
          ))}
        </Group>
      )}
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
        {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

function Row({
  o,
  lang,
  today,
  onSelect,
}: {
  o: Occurrence
  lang: Lang
  today: Date
  onSelect: (o: Occurrence) => void
}) {
  const t = makeTranslator(lang)
  const color = CATEGORY_BY_ID[o.event.categories[0]].color
  const active = isActiveOn(o, today)
  const until = daysUntilStart(o, today)
  const left = daysBetween(today, o.end)

  return (
    <button
      onClick={() => onSelect(o)}
      className="panel group flex w-full items-center gap-4 p-4 text-left transition-colors
                 hover:border-line-strong hover:bg-ink-850/70"
    >
      <span
        aria-hidden="true"
        className="h-10 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-display text-base font-semibold text-heading group-hover:text-tag-200">
            {loc(o.event.name, lang)}
          </span>
          <span className="flex gap-1 text-sm" aria-hidden="true">
            {o.event.countries.map((c) => (
              <span key={c}>{COUNTRY_BY_CODE[c].flag}</span>
            ))}
          </span>
          {o.confirmed && (
            <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
              {t('detail.confirmed')}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate font-mono text-xs text-ink-400">
          {formatRange(o, lang)} · {durationDays(o)} {t('hero.days')}
          {o.event.region ? ` · ${loc(o.event.region, lang)}` : ''}
        </p>
      </div>

      <div className="hidden shrink-0 sm:block">
        <PrecisionBadge precision={o.event.precision} lang={lang} />
      </div>

      <span
        className={`shrink-0 text-right font-mono text-xs ${
          active ? 'text-emerald-300' : 'text-ink-400'
        }`}
      >
        {active
          ? left === 0
            ? t('hero.lastDay')
            : `${t('hero.endsIn')} ${left}${t('unit.dayShort')}`
          : until === 0
            ? t('hero.today')
            : `${until}${t('unit.dayShort')}`}
      </span>
    </button>
  )
}
