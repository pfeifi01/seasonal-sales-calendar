import { dealSitesFor, type DealSite } from '../data/dealSites'
import { loc, makeTranslator } from '../i18n'
import type { CountryCode, Lang } from '../types'

interface Props {
  lang: Lang
  country: CountryCode
}

export default function DealSites({ lang, country }: Props) {
  const t = makeTranslator(lang)
  const sites = dealSitesFor(country)
  if (sites.length === 0) return null

  const comparison = sites.filter((s) => s.kind === 'comparison')
  const community = sites.filter((s) => s.kind === 'community')

  return (
    <section className="panel p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold text-heading">🔎 {t('deals.title')}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-300">
        {t('deals.subtitle')}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {comparison.length > 0 && (
          <Group title={t('deals.comparison')} sites={comparison} lang={lang} country={country} />
        )}
        {community.length > 0 && (
          <Group title={t('deals.community')} sites={community} lang={lang} country={country} />
        )}
      </div>

      <p className="mt-5 text-xs text-ink-500">{t('deals.disclosure')}</p>
    </section>
  )
}

function Group({
  title,
  sites,
  lang,
  country,
}: {
  title: string
  sites: DealSite[]
  lang: Lang
  country: CountryCode
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {sites.map((site) => (
          <li key={site.id}>
            <a
              href={site.urls[country]}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-line bg-surface p-3
                         transition-colors hover:border-tag-400/40 hover:bg-tag-400/[0.06]"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-ink-100 group-hover:text-tag-200">
                  {site.name}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-ink-500">
                  {site.urls[country]?.replace(/^https?:\/\/(www\.)?/, '')} ↗
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-400">
                {loc(site.note, lang)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
