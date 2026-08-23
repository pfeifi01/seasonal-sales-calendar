import { useEffect } from 'react'
import { CATEGORY_BY_ID } from '../data/categories'
import { COUNTRY_BY_CODE } from '../data/countries'
import { durationDays, formatFullDate } from '../lib/format'
import { loc, makeTranslator } from '../i18n'
import type { Lang, Occurrence } from '../types'
import PrecisionBadge from './PrecisionBadge'

interface Props {
  occurrence: Occurrence | null
  lang: Lang
  onClose: () => void
}

export default function EventDetail({ occurrence, lang, onClose }: Props) {
  // Escape closes the drawer. Registered unconditionally so the hook order
  // stays stable across the null/non-null render.
  useEffect(() => {
    if (!occurrence) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [occurrence, onClose])

  if (!occurrence) return null

  const { event } = occurrence
  const t = makeTranslator(lang)
  const accent = CATEGORY_BY_ID[event.categories[0]].color

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        aria-label={t('detail.close')}
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/[0.08] bg-ink-900 shadow-2xl animate-slide-in">
        <div
          aria-hidden="true"
          className="h-1 w-full shrink-0"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />

        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight text-white">
                {loc(event.name, lang)}
              </h2>
              {event.region && (
                <p className="mt-1 text-sm text-ink-400">{loc(event.region, lang)}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label={t('detail.close')}
              className="shrink-0 rounded-lg p-2 text-ink-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Dates */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold text-white">
                {formatFullDate(occurrence.start, lang)}
              </p>
              {occurrence.end.getTime() !== occurrence.start.getTime() && (
                <>
                  <p className="text-xs uppercase tracking-wider text-ink-500">→</p>
                  <p className="text-lg font-semibold text-white">
                    {formatFullDate(occurrence.end, lang)}
                  </p>
                </>
              )}
            </div>
            <p className="mt-3 font-mono text-xs text-ink-400">
              {t('detail.duration')}: {durationDays(occurrence)} {t('hero.days')}
            </p>

            <div className="mt-3 border-t border-white/[0.06] pt-3">
              {occurrence.confirmed ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  ✓ {t('detail.confirmed')}
                </span>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-tag-300">
                    ≈ {t('detail.estimated')}
                  </span>
                  <span className="text-xs leading-relaxed text-ink-400">
                    {t('detail.estimated.help')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-ink-200">{loc(event.blurb, lang)}</p>

          <PrecisionBadge precision={event.precision} lang={lang} withHelp />

          <Section title={t('detail.countries')}>
            <div className="flex flex-wrap gap-2">
              {event.countries.map((c) => (
                <span key={c} className="chip chip-off">
                  <span aria-hidden="true">{COUNTRY_BY_CODE[c].flag}</span>
                  {loc(COUNTRY_BY_CODE[c].name, lang)}
                </span>
              ))}
            </div>
          </Section>

          <Section title={t('filter.categories')}>
            <div className="flex flex-wrap gap-2">
              {event.categories.map((id) => {
                const meta = CATEGORY_BY_ID[id]
                return (
                  <span
                    key={id}
                    className="chip text-white"
                    style={{
                      borderColor: `${meta.color}55`,
                      backgroundColor: `${meta.color}1f`,
                    }}
                  >
                    <span aria-hidden="true">{meta.icon}</span>
                    {loc(meta.name, lang)}
                  </span>
                )
              })}
            </div>
          </Section>

          <Section title={t('detail.sources')}>
            <ul className="flex flex-col gap-1.5">
              {event.sources.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-xs text-sky-300 underline decoration-sky-300/30 underline-offset-2 hover:decoration-sky-300"
                  >
                    {new URL(url).hostname.replace(/^www\./, '')} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <div className="rounded-xl border border-dashed border-white/[0.1] p-4 text-center">
            <p className="text-sm font-medium text-ink-300">🔔 {t('detail.notify')}</p>
            <p className="mt-1 text-xs text-ink-500">{t('detail.notifySoon')}</p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
        {title}
      </h3>
      {children}
    </div>
  )
}
