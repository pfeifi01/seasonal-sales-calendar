import { CATEGORY_BY_ID } from '../data/categories'
import { daysUntilStart, daysBetween } from '../lib/dates'
import { formatRange } from '../lib/format'
import { loc, makeTranslator } from '../i18n'
import type { Lang, Occurrence } from '../types'

interface Props {
  lang: Lang
  active: Occurrence[]
  upcoming: Occurrence[]
  today: Date
  onSelect: (o: Occurrence) => void
}

/**
 * The answer to "is anything on right now, and what's next" — the question
 * the whole site exists to answer, so it sits above every view.
 */
export default function NextUp({ lang, active, upcoming, today, onSelect }: Props) {
  const t = makeTranslator(lang)
  const next = upcoming[0]

  if (active.length === 0 && !next) return null

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {active.length > 0 && (
        <Card
          accent="#22c55e"
          eyebrow={
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {t('hero.livenow')}
            </span>
          }
        >
          <ul className="flex flex-col gap-2">
            {active.slice(0, 3).map((o) => {
              const left = daysBetween(today, o.end)
              return (
                <li key={`${o.event.id}-${o.start.getTime()}`}>
                  <button
                    onClick={() => onSelect(o)}
                    className="group flex w-full items-baseline justify-between gap-3 rounded-lg
                               px-2 py-1.5 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="font-display text-lg font-semibold text-heading group-hover:text-tag-200">
                      {loc(o.event.name, lang)}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-emerald-300/90">
                      {left === 0
                        ? t('hero.lastDay')
                        : `${t('hero.endsIn')} ${left} ${left === 1 ? t('hero.day') : t('hero.days')}`}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      {next && (
        <Card accent={CATEGORY_BY_ID[next.event.categories[0]].color} eyebrow={t('hero.next')}>
          <button
            onClick={() => onSelect(next)}
            className="group w-full text-left"
          >
            <p className="font-display text-2xl font-bold leading-tight text-heading group-hover:text-tag-200">
              {loc(next.event.name, lang)}
            </p>
            <p className="mt-1 font-mono text-sm text-ink-300">{formatRange(next, lang)}</p>
            <p className="mt-3 text-sm font-semibold text-tag-300">
              <Countdown days={daysUntilStart(next, today)} lang={lang} />
            </p>
          </button>
        </Card>
      )}
    </section>
  )
}

function Countdown({ days, lang }: { days: number; lang: Lang }) {
  const t = makeTranslator(lang)
  if (days <= 0) return <>{t('hero.today')}</>
  if (days === 1) return <>{t('hero.tomorrow')}</>
  return (
    <>
      {t('hero.startsIn')} <span className="text-lg">{days}</span> {t('hero.days')}
    </>
  )
}

function Card({
  accent,
  eyebrow,
  children,
}: {
  accent: string
  eyebrow: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="panel relative overflow-hidden p-5 animate-fade-up">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
        {eyebrow}
      </p>
      {children}
    </div>
  )
}
