import { COUNTRIES } from '../data/countries'
import { LANGS, makeTranslator, loc } from '../i18n'
import type { CountryCode, Lang } from '../types'

interface Props {
  country: CountryCode
  onCountry: (c: CountryCode) => void
  lang: Lang
  onLang: (l: Lang) => void
}

export default function Header({ country, onCountry, lang, onLang }: Props) {
  const t = makeTranslator(lang)

  return (
    <header className="border-b border-white/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-tag-400 to-tag-600 text-xl shadow-lg shadow-tag-600/25"
            >
              🏷️
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">
                {t('app.title')}
              </h1>
              <p className="max-w-xl text-sm text-ink-400">{t('app.tagline')}</p>
            </div>
          </div>

          <div
            className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5"
            role="group"
            aria-label="Language"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => onLang(l.code)}
                aria-pressed={lang === l.code}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  lang === l.code
                    ? 'bg-white/10 text-white'
                    : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label={t('detail.countries')}>
          {COUNTRIES.map((c) => {
            const active = c.code === country
            return (
              <button
                key={c.code}
                onClick={() => onCountry(c.code)}
                aria-pressed={active}
                className={`chip ${
                  active
                    ? 'border-tag-400/50 bg-tag-400/15 text-tag-200'
                    : 'chip-off'
                }`}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {c.flag}
                </span>
                {loc(c.name, lang)}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
