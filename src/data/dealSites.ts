import type { CountryCode, Localized } from '../types'

/**
 * Where to actually check a price once the calendar says a sale is on.
 *
 * These are plain outbound links, deliberately: none of these sites offers a
 * general public API, and scraping them would be both fragile and against
 * their terms. See docs/KNOWN_ISSUES.md for what a real feed integration
 * would involve.
 *
 * No affiliate or referral parameters are attached to any of these URLs. If
 * that ever changes it should be a deliberate, disclosed decision.
 */
export interface DealSite {
  id: string
  name: string
  /** Country-specific domains. A country missing here does not show the site. */
  urls: Partial<Record<CountryCode, string>>
  /**
   * `comparison` — a price search engine, best for "is this actually cheap?"
   * `community` — users post individual deals, best for "what is hot today?"
   */
  kind: 'comparison' | 'community'
  note: Localized
}

export const DEAL_SITES: DealSite[] = [
  {
    id: 'geizhals',
    name: 'Geizhals',
    kind: 'comparison',
    urls: { AT: 'https://geizhals.at', DE: 'https://geizhals.de' },
    note: {
      en: 'Vienna-based, running since 1996. The price-history graph is the useful part — it shows whether a "Black Friday price" is actually a low.',
      de: 'Aus Wien, seit 1996. Der Preisverlauf ist das Entscheidende — er zeigt, ob ein „Black-Friday-Preis" wirklich ein Tiefstand ist.',
      it: 'Con sede a Vienna, attivo dal 1996. Il grafico dello storico prezzi è la parte utile: mostra se un “prezzo Black Friday” è davvero un minimo.',
    },
  },
  {
    id: 'idealo',
    name: 'idealo',
    kind: 'comparison',
    urls: { DE: 'https://www.idealo.de', AT: 'https://www.idealo.at', IT: 'https://www.idealo.it' },
    note: {
      en: 'Very broad catalogue with price alerts and history charts.',
      de: 'Sehr breiter Katalog mit Preisalarm und Verlaufsdiagrammen.',
      it: 'Catalogo molto ampio con avvisi di prezzo e grafici storici.',
    },
  },
  {
    id: 'toppreise',
    name: 'Toppreise',
    kind: 'comparison',
    urls: { CH: 'https://www.toppreise.ch' },
    note: {
      en: 'The established Swiss price comparison site — worth checking against German prices before importing.',
      de: 'Der etablierte Schweizer Preisvergleich — lohnt den Abgleich mit deutschen Preisen, bevor man importiert.',
      it: 'Il comparatore svizzero di riferimento — utile confrontarlo con i prezzi tedeschi prima di importare.',
    },
  },
  {
    id: 'trovaprezzi',
    name: 'Trovaprezzi',
    kind: 'comparison',
    urls: { IT: 'https://www.trovaprezzi.it' },
    note: {
      en: 'The most-visited price comparison site in Italy.',
      de: 'Die meistbesuchte Preisvergleichsseite Italiens.',
      it: 'Il sito di comparazione prezzi più visitato in Italia.',
    },
  },
  {
    id: 'preisjaeger',
    name: 'Preisjäger',
    kind: 'community',
    urls: { AT: 'https://www.preisjaeger.at' },
    note: {
      en: 'Austrian deal community — members post and vote on individual offers as they appear.',
      de: 'Österreichische Deal-Community — Mitglieder posten und bewerten einzelne Angebote, sobald sie auftauchen.',
      it: 'Community austriaca di offerte — gli utenti pubblicano e votano le singole offerte appena escono.',
    },
  },
  {
    id: 'mydealz',
    name: 'mydealz',
    kind: 'community',
    urls: { DE: 'https://www.mydealz.de' },
    note: {
      en: 'The German equivalent, and the largest of the group. Good for catching short-lived errors and stacking codes.',
      de: 'Das deutsche Pendant und das größte davon. Gut für kurzlebige Preisfehler und kombinierbare Gutscheine.',
      it: 'L’equivalente tedesco, il più grande del gruppo. Utile per errori di prezzo di breve durata e codici cumulabili.',
    },
  },
  {
    id: 'preispirat',
    name: 'Preispirat',
    kind: 'community',
    urls: { CH: 'https://www.preispirat.ch' },
    note: {
      en: 'Swiss deal community, the closest local equivalent to mydealz.',
      de: 'Schweizer Deal-Community, das nächste lokale Pendant zu mydealz.',
      it: 'Community svizzera di offerte, l’equivalente locale più vicino a mydealz.',
    },
  },
]

/** Sites that have a domain for the selected country. */
export function dealSitesFor(country: CountryCode): DealSite[] {
  return DEAL_SITES.filter((s) => s.urls[country])
}
