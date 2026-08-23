import type { Lang, Localized } from './types'

/**
 * UI strings. The dataset itself carries its own translations (see
 * `types.ts` → `Localized`); this covers only the chrome around it.
 *
 * Built in from the start deliberately: the whole audience is German- and
 * Italian-speaking, and retrofitting i18n onto a finished UI is painful.
 */
const STRINGS = {
  'app.title': { en: 'Sale Season', de: 'Sale Season', it: 'Sale Season' },
  'app.tagline': {
    en: 'Every sale worth waiting for, across Austria, Germany, Switzerland and Italy.',
    de: 'Jeder Sale, auf den sich Warten lohnt — in Österreich, Deutschland, der Schweiz und Italien.',
    it: 'Tutti i saldi che vale la pena aspettare, in Austria, Germania, Svizzera e Italia.',
  },

  'nav.year': { en: 'Year', de: 'Jahr', it: 'Anno' },
  'nav.month': { en: 'Month', de: 'Monat', it: 'Mese' },
  'nav.list': { en: 'Upcoming', de: 'Demnächst', it: 'Prossimi' },

  'filter.categories': { en: 'Categories', de: 'Kategorien', it: 'Categorie' },
  'filter.seasons': { en: 'Seasons', de: 'Jahreszeiten', it: 'Stagioni' },
  'filter.all': { en: 'All', de: 'Alle', it: 'Tutte' },
  'filter.clear': { en: 'Clear filters', de: 'Filter zurücksetzen', it: 'Azzera filtri' },
  'filter.search': { en: 'Search sales…', de: 'Sales suchen…', it: 'Cerca saldi…' },
  'filter.showing': { en: 'showing', de: 'zeigt', it: 'mostra' },
  'filter.of': { en: 'of', de: 'von', it: 'di' },
  'filter.sales': { en: 'sales', de: 'Sales', it: 'saldi' },
  'filter.none': {
    en: 'No sales match these filters.',
    de: 'Keine Sales passen zu diesen Filtern.',
    it: 'Nessun saldo corrisponde a questi filtri.',
  },

  'hero.next': { en: 'Next up', de: 'Als Nächstes', it: 'Prossimo' },
  'hero.livenow': { en: 'On right now', de: 'Läuft gerade', it: 'In corso ora' },
  'hero.startsIn': { en: 'starts in', de: 'startet in', it: 'inizia tra' },
  'hero.endsIn': { en: 'ends in', de: 'endet in', it: 'finisce tra' },
  'hero.days': { en: 'days', de: 'Tagen', it: 'giorni' },
  'hero.day': { en: 'day', de: 'Tag', it: 'giorno' },
  /** Compact unit for countdown pills, where the full word will not fit. */
  'unit.dayShort': { en: 'd', de: 'T', it: 'g' },
  'hero.today': { en: 'starts today', de: 'startet heute', it: 'inizia oggi' },
  'hero.tomorrow': { en: 'starts tomorrow', de: 'startet morgen', it: 'inizia domani' },
  'hero.lastDay': { en: 'last day', de: 'letzter Tag', it: 'ultimo giorno' },

  'precision.regulated': { en: 'Official dates', de: 'Amtliche Termine', it: 'Date ufficiali' },
  'precision.traditional': { en: 'Traditional', de: 'Traditionell', it: 'Tradizionale' },
  'precision.retailer': { en: 'Retail event', de: 'Handelsaktion', it: 'Evento commerciale' },
  'precision.regulated.help': {
    en: 'Set by law or by an official body. Shops are bound by these dates.',
    de: 'Gesetzlich oder von einer Behörde festgelegt. Die Geschäfte sind an diese Termine gebunden.',
    it: 'Stabilite per legge o da un ente ufficiale. I negozi sono vincolati a queste date.',
  },
  'precision.traditional.help': {
    en: 'No longer regulated, but most retailers still follow the old window.',
    de: 'Nicht mehr geregelt, aber die meisten Händler halten sich weiter an das alte Fenster.',
    it: 'Non più regolamentato, ma la maggior parte dei negozi segue ancora la vecchia finestra.',
  },
  'precision.retailer.help': {
    en: 'A marketing event with no official date. Individual shops vary.',
    de: 'Eine Marketingaktion ohne offizielles Datum. Einzelne Geschäfte weichen ab.',
    it: 'Un evento di marketing senza data ufficiale. I singoli negozi variano.',
  },

  'detail.confirmed': { en: 'Confirmed dates', de: 'Bestätigte Termine', it: 'Date confermate' },
  'detail.estimated': { en: 'Estimated', de: 'Geschätzt', it: 'Stimate' },
  'detail.estimated.help': {
    en: 'Official dates for this year have not been published yet. Shown from the usual pattern.',
    de: 'Die offiziellen Termine für dieses Jahr sind noch nicht veröffentlicht. Angezeigt nach dem üblichen Muster.',
    it: 'Le date ufficiali per quest’anno non sono ancora state pubblicate. Mostrate secondo lo schema abituale.',
  },
  'detail.countries': { en: 'Applies to', de: 'Gilt für', it: 'Vale per' },
  'detail.region': { en: 'Region', de: 'Region', it: 'Regione' },
  'detail.sources': { en: 'Sources', de: 'Quellen', it: 'Fonti' },
  'detail.close': { en: 'Close', de: 'Schließen', it: 'Chiudi' },
  'detail.duration': { en: 'Duration', de: 'Dauer', it: 'Durata' },
  'detail.notify': { en: 'Notify me', de: 'Benachrichtigen', it: 'Avvisami' },
  'detail.notifySoon': {
    en: 'Email reminders are coming in the next version.',
    de: 'E-Mail-Erinnerungen kommen in der nächsten Version.',
    it: 'I promemoria via email arrivano nella prossima versione.',
  },

  'year.prev': { en: 'Previous year', de: 'Vorheriges Jahr', it: 'Anno precedente' },
  'year.next': { en: 'Next year', de: 'Nächstes Jahr', it: 'Anno successivo' },
  'year.today': { en: 'Today', de: 'Heute', it: 'Oggi' },

  'list.empty': {
    en: 'Nothing coming up with these filters.',
    de: 'Mit diesen Filtern steht nichts an.',
    it: 'Non c’è nulla in arrivo con questi filtri.',
  },
  'list.active': { en: 'Running now', de: 'Läuft jetzt', it: 'In corso' },
  'list.upcoming': { en: 'Coming up', de: 'Demnächst', it: 'In arrivo' },

  'footer.note': {
    en: 'Dates are checked against official sources where they exist. Everything else is the common retail pattern — always confirm with the shop.',
    de: 'Termine sind, wo vorhanden, gegen amtliche Quellen geprüft. Alles andere ist das übliche Handelsmuster — bitte immer beim Geschäft nachfragen.',
    it: 'Le date sono verificate su fonti ufficiali dove esistono. Il resto segue la consueta prassi commerciale — conferma sempre col negozio.',
  },
} satisfies Record<string, Localized>

export type StringKey = keyof typeof STRINGS

export function makeTranslator(lang: Lang) {
  return (key: StringKey): string => STRINGS[key][lang]
}

export function loc(value: Localized, lang: Lang): string {
  return value[lang]
}

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' },
]
