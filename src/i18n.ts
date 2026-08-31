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
    en: 'Set up an email reminder before sales start.',
    de: 'Richte eine E-Mail-Erinnerung vor dem Sale-Start ein.',
    it: 'Imposta un promemoria email prima dell’inizio dei saldi.',
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

  'theme.auto': { en: 'Auto', de: 'Auto', it: 'Auto' },
  'theme.light': { en: 'Light', de: 'Hell', it: 'Chiaro' },
  'theme.dark': { en: 'Dark', de: 'Dunkel', it: 'Scuro' },
  'theme.label': { en: 'Theme', de: 'Design', it: 'Tema' },

  'deals.title': { en: 'Check the price', de: 'Preis prüfen', it: 'Controlla il prezzo' },
  'deals.subtitle': {
    en: 'The calendar says when. These say whether it is actually cheap — a price-history chart is the quickest way to spot a discount off an inflated list price.',
    de: 'Der Kalender sagt wann. Diese Seiten sagen, ob es wirklich günstig ist — ein Preisverlauf entlarvt einen Rabatt auf einen zuvor erhöhten Listenpreis am schnellsten.',
    it: 'Il calendario dice quando. Questi dicono se conviene davvero — lo storico prezzi è il modo più rapido per smascherare uno sconto su un listino gonfiato.',
  },
  'deals.comparison': {
    en: 'Price comparison',
    de: 'Preisvergleich',
    it: 'Comparazione prezzi',
  },
  'deals.community': {
    en: 'Deal communities',
    de: 'Deal-Communities',
    it: 'Community di offerte',
  },
  'deals.disclosure': {
    en: 'Plain links — no affiliate or referral tracking.',
    de: 'Reine Links — kein Affiliate- oder Referral-Tracking.',
    it: 'Link semplici — nessun tracciamento di affiliazione o referral.',
  },

  'notify.title': { en: 'Email reminders', de: 'E-Mail-Erinnerungen', it: 'Promemoria email' },
  'notify.subtitle': {
    en: 'Get an email before each sale starts. Unsubscribe with one click, any time.',
    de: 'Erhalte eine E-Mail, bevor ein Sale startet. Abmeldung jederzeit mit einem Klick.',
    it: 'Ricevi un’email prima che inizi ogni saldo. Disiscrizione con un clic, quando vuoi.',
  },
  'notify.email': { en: 'Email address', de: 'E-Mail-Adresse', it: 'Indirizzo email' },
  'notify.lead': { en: 'Remind me', de: 'Erinnere mich', it: 'Avvisami' },
  'notify.leadDays': {
    en: '{n} days before',
    de: '{n} Tage vorher',
    it: '{n} giorni prima',
  },
  'notify.leadOneDay': { en: '1 day before', de: '1 Tag vorher', it: '1 giorno prima' },
  'notify.categoriesOptional': {
    en: 'Only these categories (optional)',
    de: 'Nur diese Kategorien (optional)',
    it: 'Solo queste categorie (facoltativo)',
  },
  'notify.allCategories': {
    en: 'Leave empty for everything.',
    de: 'Leer lassen für alles.',
    it: 'Lascia vuoto per tutto.',
  },
  'notify.submit': { en: 'Send confirmation', de: 'Bestätigung senden', it: 'Invia conferma' },
  'notify.sending': { en: 'Sending…', de: 'Wird gesendet…', it: 'Invio…' },
  'notify.sent': {
    en: 'Check your inbox and click the link to confirm.',
    de: 'Schau in dein Postfach und klicke den Link zur Bestätigung.',
    it: 'Controlla la posta e clicca il link per confermare.',
  },
  'notify.updated': {
    en: 'Your preferences have been updated.',
    de: 'Deine Einstellungen wurden aktualisiert.',
    it: 'Le tue preferenze sono state aggiornate.',
  },
  'notify.forCountry': { en: 'for', de: 'für', it: 'per' },
  'notify.error.invalid_email': {
    en: 'That does not look like a valid email address.',
    de: 'Das sieht nicht nach einer gültigen E-Mail-Adresse aus.',
    it: 'Non sembra un indirizzo email valido.',
  },
  'notify.error.too_many_requests': {
    en: 'Too many signups from here. Try again in an hour.',
    de: 'Zu viele Anmeldungen von hier. Versuche es in einer Stunde erneut.',
    it: 'Troppe iscrizioni da qui. Riprova tra un’ora.',
  },
  'notify.error.email_failed': {
    en: 'The confirmation email could not be sent. Try again later.',
    de: 'Die Bestätigungs-E-Mail konnte nicht gesendet werden. Versuche es später erneut.',
    it: 'Impossibile inviare l’email di conferma. Riprova più tardi.',
  },
  'notify.error.generic': {
    en: 'Something went wrong. Try again.',
    de: 'Etwas ist schiefgelaufen. Versuche es erneut.',
    it: 'Qualcosa è andato storto. Riprova.',
  },
  'push.title': { en: 'Or push to this device', de: 'Oder Push auf dieses Gerät', it: 'Oppure push su questo dispositivo' },
  'push.subtitle': {
    en: 'Same reminders, delivered to this phone or computer instead of your inbox. Add the site to your home screen first for the best result.',
    de: 'Dieselben Erinnerungen, direkt auf dieses Handy oder diesen Rechner statt ins Postfach. Am besten die Seite vorher zum Startbildschirm hinzufügen.',
    it: 'Gli stessi promemoria, su questo telefono o computer invece che via email. Meglio aggiungere prima il sito alla schermata Home.',
  },
  'push.enable': { en: 'Enable push', de: 'Push aktivieren', it: 'Attiva push' },
  'push.disable': { en: 'Turn off push', de: 'Push deaktivieren', it: 'Disattiva push' },
  'push.enabled': { en: 'Push is on for this device.', de: 'Push ist auf diesem Gerät aktiv.', it: 'Push attivo su questo dispositivo.' },
  'push.working': { en: 'Working…', de: 'Läuft…', it: 'In corso…' },
  'push.error.unsupported': {
    en: 'This browser does not support push notifications.',
    de: 'Dieser Browser unterstützt keine Push-Benachrichtigungen.',
    it: 'Questo browser non supporta le notifiche push.',
  },
  'push.error.denied': {
    en: 'Notifications are blocked. Allow them in your browser settings and try again.',
    de: 'Benachrichtigungen sind blockiert. Erlaube sie in den Browsereinstellungen und versuche es erneut.',
    it: 'Le notifiche sono bloccate. Consentile nelle impostazioni del browser e riprova.',
  },
  'push.error.disabled': {
    en: 'Push is not configured on the server yet.',
    de: 'Push ist auf dem Server noch nicht eingerichtet.',
    it: 'Il push non è ancora configurato sul server.',
  },
  'push.error.failed': {
    en: 'Could not enable push here. On iPhone, add the site to your home screen first.',
    de: 'Push konnte hier nicht aktiviert werden. Auf dem iPhone die Seite zuerst zum Startbildschirm hinzufügen.',
    it: 'Impossibile attivare il push qui. Su iPhone aggiungi prima il sito alla schermata Home.',
  },

  'notify.privacy': {
    en: 'Your address is stored only to send these reminders. Nothing else, nobody else.',
    de: 'Deine Adresse wird nur für diese Erinnerungen gespeichert. Nichts anderes, niemand sonst.',
    it: 'Il tuo indirizzo è conservato solo per questi promemoria. Nient’altro, nessun altro.',
  },

  'footer.note': {
    en: 'Dates are checked against official sources where they exist. Everything else is the common retail pattern — always confirm with the shop.',
    de: 'Termine sind, wo vorhanden, gegen amtliche Quellen geprüft. Alles andere ist das übliche Handelsmuster — bitte immer beim Geschäft nachfragen.',
    it: 'Le date sono verificate su fonti ufficiali dove esistono. Il resto segue la consueta prassi commerciale — conferma sempre col negozio.',
  },
} satisfies Record<string, Localized>

export type StringKey = keyof typeof STRINGS

export function makeTranslator(lang: Lang) {
  return (key: StringKey, vars?: Record<string, string | number>): string => {
    const raw: string = STRINGS[key][lang]
    if (!vars) return raw
    return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''))
  }
}

export function loc(value: Localized, lang: Lang): string {
  return value[lang]
}

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' },
]
