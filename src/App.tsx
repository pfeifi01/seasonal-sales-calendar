import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Filters from './components/Filters'
import NextUp from './components/NextUp'
import YearTimeline from './components/YearTimeline'
import MonthGrid from './components/MonthGrid'
import UpcomingList from './components/UpcomingList'
import EventDetail from './components/EventDetail'
import { EVENTS } from './data/events'
import { isActiveOn, occurrencesInYear, startOfDay, upcomingFrom } from './lib/dates'
import { formatMonth } from './lib/format'
import { loc, makeTranslator } from './i18n'
import type { CategoryId, CountryCode, Lang, Occurrence, Season } from './types'

type View = 'year' | 'month' | 'list'

const STORAGE_KEY = 'sale-season.prefs'

interface Prefs {
  country: CountryCode
  lang: Lang
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { country: 'AT', lang: 'en', ...JSON.parse(raw) }
  } catch {
    // Corrupt or unavailable storage is not worth failing the app over.
  }
  return { country: 'AT', lang: 'en' }
}

export default function App() {
  const initial = useMemo(loadPrefs, [])
  const today = useMemo(() => startOfDay(new Date()), [])

  const [country, setCountry] = useState<CountryCode>(initial.country)
  const [lang, setLang] = useState<Lang>(initial.lang)
  const [view, setView] = useState<View>('year')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [categories, setCategories] = useState<Set<CategoryId>>(new Set())
  const [seasons, setSeasons] = useState<Set<Season>>(new Set())
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Occurrence | null>(null)

  const t = makeTranslator(lang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ country, lang }))
  }, [country, lang])

  const inCountry = useMemo(
    () => EVENTS.filter((e) => e.countries.includes(country)),
    [country],
  )

  /** Empty filter sets mean "no restriction", which keeps the default view
   *  full rather than empty and avoids a separate "all" toggle. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return inCountry.filter((e) => {
      if (categories.size > 0 && !e.categories.some((c) => categories.has(c))) return false
      if (seasons.size > 0 && (!e.season || !seasons.has(e.season))) return false
      if (q) {
        const haystack = [
          loc(e.name, lang),
          loc(e.blurb, lang),
          e.region ? loc(e.region, lang) : '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [inCountry, categories, seasons, query, lang])

  const yearOccurrences = useMemo(
    () => occurrencesInYear(filtered, year),
    [filtered, year],
  )

  const monthOccurrences = useMemo(() => {
    // A period overlapping the visible grid, not only one starting in it.
    const from = new Date(year, month - 1, 1)
    const to = new Date(year, month + 2, 0)
    return occurrencesInYear(filtered, year)
      .concat(occurrencesInYear(filtered, year + 1))
      .filter((o) => o.end >= from && o.start <= to)
  }, [filtered, year, month])

  const upcoming = useMemo(() => upcomingFrom(filtered, today), [filtered, today])
  const activeNow = useMemo(
    () => upcoming.filter((o) => isActiveOn(o, today)),
    [upcoming, today],
  )
  const notYetStarted = useMemo(
    () => upcoming.filter((o) => !isActiveOn(o, today)),
    [upcoming, today],
  )

  function toggle<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  function clearFilters() {
    setCategories(new Set())
    setSeasons(new Set())
    setQuery('')
  }

  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  function stepMonth(delta: number) {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  return (
    <div className="min-h-screen">
      <Header country={country} onCountry={setCountry} lang={lang} onLang={setLang} />

      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <NextUp
          lang={lang}
          active={activeNow}
          upcoming={notYetStarted}
          today={today}
          onSelect={setSelected}
        />

        <Filters
          lang={lang}
          categories={categories}
          onToggleCategory={(id) => setCategories((s) => toggle(s, id))}
          seasons={seasons}
          onToggleSeason={(id) => setSeasons((s) => toggle(s, id))}
          query={query}
          onQuery={setQuery}
          onClear={clearFilters}
          shown={filtered.length}
          total={inCountry.length}
        />

        {/* View switcher + period navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1"
            role="tablist"
          >
            {(['year', 'month', 'list'] as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                  view === v
                    ? 'bg-tag-500 text-ink-950'
                    : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {t(`nav.${v}` as 'nav.year' | 'nav.month' | 'nav.list')}
              </button>
            ))}
          </div>

          {view !== 'list' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => (view === 'year' ? setYear((y) => y - 1) : stepMonth(-1))}
                aria-label={t('year.prev')}
                className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-ink-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                ‹
              </button>
              <span className="min-w-[9rem] text-center font-display text-lg font-semibold text-white">
                {view === 'year' ? year : formatMonth(year, month, lang)}
              </span>
              <button
                onClick={() => (view === 'year' ? setYear((y) => y + 1) : stepMonth(1))}
                aria-label={t('year.next')}
                className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-ink-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                ›
              </button>
              <button
                onClick={goToday}
                className="ml-1 rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-ink-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {t('year.today')}
              </button>
            </div>
          )}
        </div>

        {view === 'year' && (
          <YearTimeline
            lang={lang}
            year={year}
            occurrences={yearOccurrences}
            today={today}
            onSelect={setSelected}
          />
        )}
        {view === 'month' && (
          <MonthGrid
            lang={lang}
            year={year}
            month={month}
            occurrences={monthOccurrences}
            today={today}
            onSelect={setSelected}
          />
        )}
        {view === 'list' && (
          <UpcomingList
            lang={lang}
            occurrences={upcoming}
            today={today}
            onSelect={setSelected}
          />
        )}

        <footer className="mt-4 border-t border-white/[0.06] pt-5 pb-8">
          <p className="max-w-3xl text-xs leading-relaxed text-ink-500">{t('footer.note')}</p>
        </footer>
      </main>

      <EventDetail occurrence={selected} lang={lang} onClose={() => setSelected(null)} />
    </div>
  )
}
