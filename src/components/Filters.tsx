import { CATEGORIES, SEASONS } from '../data/categories'
import { loc, makeTranslator } from '../i18n'
import type { CategoryId, Lang, Season } from '../types'

interface Props {
  lang: Lang
  categories: Set<CategoryId>
  onToggleCategory: (id: CategoryId) => void
  seasons: Set<Season>
  onToggleSeason: (id: Season) => void
  query: string
  onQuery: (q: string) => void
  onClear: () => void
  shown: number
  total: number
}

export default function Filters({
  lang,
  categories,
  onToggleCategory,
  seasons,
  onToggleSeason,
  query,
  onQuery,
  onClear,
  shown,
  total,
}: Props) {
  const t = makeTranslator(lang)
  const anyFilter = categories.size > 0 || seasons.size > 0 || query.trim() !== ''

  return (
    <section className="panel p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex-1 min-w-[14rem]">
            <span className="sr-only">{t('filter.search')}</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            >
              🔍
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={t('filter.search')}
              className="w-full rounded-xl border border-line bg-ink-950/60 py-2.5 pl-10 pr-3
                         text-sm text-ink-100 placeholder:text-ink-500
                         focus:border-tag-400/40 focus:outline-none focus:ring-1 focus:ring-tag-400/40"
            />
          </label>

          <p className="font-mono text-xs text-ink-400" aria-live="polite">
            {t('filter.showing')}{' '}
            <span className="font-semibold text-ink-200">{shown}</span> {t('filter.of')} {total}{' '}
            {t('filter.sales')}
          </p>

          {anyFilter && (
            <button
              onClick={onClear}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-400
                         transition-colors hover:bg-surface-2 hover:text-ink-100"
            >
              ✕ {t('filter.clear')}
            </button>
          )}
        </div>

        <FilterRow label={t('filter.categories')}>
          {CATEGORIES.map((c) => {
            const active = categories.has(c.id)
            return (
              <button
                key={c.id}
                onClick={() => onToggleCategory(c.id)}
                aria-pressed={active}
                className={`chip ${active ? 'text-heading' : 'chip-off'}`}
                style={
                  active
                    ? { borderColor: `${c.color}66`, backgroundColor: `${c.color}22` }
                    : undefined
                }
              >
                <span aria-hidden="true">{c.icon}</span>
                {loc(c.name, lang)}
              </button>
            )
          })}
        </FilterRow>

        <FilterRow label={t('filter.seasons')}>
          {SEASONS.map((s) => {
            const active = seasons.has(s.id)
            return (
              <button
                key={s.id}
                onClick={() => onToggleSeason(s.id)}
                aria-pressed={active}
                className={`chip ${
                  active ? 'border-tag-400/50 bg-tag-400/15 text-tag-200' : 'chip-off'
                }`}
              >
                <span aria-hidden="true">{s.icon}</span>
                {loc(s.name, lang)}
              </button>
            )
          })}
        </FilterRow>
      </div>
    </section>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-500 sm:w-24">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
