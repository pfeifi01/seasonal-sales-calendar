import type { SaleEvent } from '../types'

/**
 * The seed dataset.
 *
 * Ground rules, because this is the part that is easy to get wrong:
 *
 * 1. `precision` is never guessed. `regulated` is only used where an
 *    official body actually publishes binding dates (the Italian regions
 *    and the Bolzano Chamber of Commerce). Germany and Austria deregulated
 *    seasonal sales in 2004/2003, so their WSV/SSV are `traditional`, and
 *    Switzerland never regulated them at all.
 * 2. `overrides` hold dates that have been published and checked. The
 *    `start`/`end` rules are only a best-effort model of the usual pattern
 *    and the UI labels anything resolved from them as an estimate.
 * 3. Every event cites at least one source.
 *
 * Weekday numbers follow `Date.getDay()`: 0 = Sunday … 6 = Saturday.
 */

const SRC = {
  bolzano:
    'https://www.handelskammer.bz.it/de/dienstleistungen/marktregelung/saisonschlussverk%C3%A4ufe',
  confcommercio: 'https://www.confcommercio.it/-/saldi-invernali-regole-e-calendario',
  evz: 'https://www.evz.de/en/topics/internet-shopping/retail-store/sales-periods/',
  saisonschlussverkauf: 'https://de.wikipedia.org/wiki/Saisonschlussverkauf',
  blackFriday: 'https://en.wikipedia.org/wiki/Black_Friday_(shopping)',
  primeDay: 'https://en.wikipedia.org/wiki/Amazon_Prime_Day',
  singlesDay: 'https://en.wikipedia.org/wiki/Singles%27_Day',
}

export const EVENTS: SaleEvent[] = [
  // ─────────────────────────────────────────────────────────────────────
  // Retail deal days — no official dates anywhere, but the same everywhere
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'black-friday',
    name: { en: 'Black Friday', de: 'Black Friday', it: 'Black Friday' },
    blurb: {
      en: 'The single biggest discount day of the year. Falls on the day after US Thanksgiving, so the date moves — it is not simply the fourth Friday of November.',
      de: 'Der größte Rabatttag des Jahres. Er fällt auf den Tag nach dem US-Thanksgiving, das Datum wandert also — es ist nicht einfach der vierte Freitag im November.',
      it: 'Il giorno di sconti più grande dell’anno. Cade il giorno dopo il Ringraziamento americano, quindi la data si sposta — non è semplicemente il quarto venerdì di novembre.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['electronics', 'fashion', 'home', 'toys', 'general'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'nthWeekday', month: 11, weekday: 4, nth: 4 }, offsetDays: 1 },
    end: { durationDays: 1 },
    sources: [SRC.blackFriday],
  },
  {
    id: 'black-week',
    name: { en: 'Black Week', de: 'Black Week', it: 'Black Week' },
    blurb: {
      en: 'Most large retailers no longer run a single day. Offers now open the Monday before Black Friday and run through to Cyber Monday.',
      de: 'Die meisten großen Händler machen längst keinen einzelnen Tag mehr. Die Angebote starten am Montag vor dem Black Friday und laufen bis zum Cyber Monday.',
      it: 'La maggior parte dei grandi rivenditori non fa più un solo giorno. Le offerte iniziano il lunedì prima del Black Friday e proseguono fino al Cyber Monday.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['general', 'electronics', 'fashion'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'nthWeekday', month: 11, weekday: 4, nth: 4 }, offsetDays: -3 },
    end: { rule: { kind: 'nthWeekday', month: 11, weekday: 4, nth: 4 }, offsetDays: 4 },
    sources: [SRC.blackFriday],
  },
  {
    id: 'cyber-monday',
    name: { en: 'Cyber Monday', de: 'Cyber Monday', it: 'Cyber Monday' },
    blurb: {
      en: 'The online-only tail of Black Friday weekend, traditionally the strongest day for electronics and software.',
      de: 'Der reine Online-Ausläufer des Black-Friday-Wochenendes, traditionell der stärkste Tag für Elektronik und Software.',
      it: 'La coda solo online del weekend del Black Friday, tradizionalmente il giorno migliore per elettronica e software.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['electronics', 'general'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'nthWeekday', month: 11, weekday: 4, nth: 4 }, offsetDays: 4 },
    end: { durationDays: 1 },
    sources: [SRC.blackFriday],
  },
  {
    id: 'singles-day',
    name: { en: "Singles' Day", de: 'Singles Day', it: 'Singles Day' },
    blurb: {
      en: 'Originally a Chinese shopping holiday on 11.11, now used by European electronics and fashion retailers as a warm-up to Black Friday.',
      de: 'Ursprünglich ein chinesischer Shopping-Feiertag am 11.11., den europäische Elektronik- und Modehändler inzwischen als Aufwärmrunde zum Black Friday nutzen.',
      it: 'Nato come festa dello shopping cinese l’11.11, oggi usato dai rivenditori europei di elettronica e moda come riscaldamento verso il Black Friday.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['electronics', 'fashion', 'general'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'fixed', month: 11, day: 11 } },
    end: { durationDays: 1 },
    sources: [SRC.singlesDay],
  },
  {
    id: 'amazon-prime-day',
    name: { en: 'Amazon Prime Day', de: 'Amazon Prime Day', it: 'Amazon Prime Day' },
    blurb: {
      en: 'Amazon’s own summer sale, for Prime members only. Amazon announces the dates a few weeks ahead — the entry here is the usual mid-July slot until then.',
      de: 'Amazons eigener Sommer-Sale, nur für Prime-Mitglieder. Amazon gibt die Termine erst wenige Wochen vorher bekannt — bis dahin steht hier der übliche Slot Mitte Juli.',
      it: 'I saldi estivi di Amazon, riservati ai membri Prime. Amazon annuncia le date con poche settimane di anticipo — fino ad allora qui trovi la consueta finestra di metà luglio.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['electronics', 'home', 'general'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'nthWeekday', month: 7, weekday: 2, nth: 2 } },
    end: { durationDays: 2 },
    sources: [SRC.primeDay],
  },
  {
    id: 'prime-big-deal-days',
    name: {
      en: 'Prime Big Deal Days',
      de: 'Prime Big Deal Days',
      it: 'Prime Big Deal Days',
    },
    blurb: {
      en: 'Amazon’s autumn repeat of Prime Day, positioned as an early start to Christmas shopping.',
      de: 'Amazons Herbst-Neuauflage des Prime Day, positioniert als früher Start ins Weihnachtsgeschäft.',
      it: 'La replica autunnale del Prime Day, presentata come partenza anticipata degli acquisti natalizi.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['electronics', 'home', 'general'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'nthWeekday', month: 10, weekday: 2, nth: 2 } },
    end: { durationDays: 2 },
    sources: [SRC.primeDay],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Italy — nationally coordinated, dates set per region
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'it-saldi-invernali',
    name: {
      en: 'Winter sales (saldi invernali)',
      de: 'Winterschlussverkauf (saldi invernali)',
      it: 'Saldi invernali',
    },
    blurb: {
      en: 'Legally regulated in Italy. The Conference of Regions coordinates a common start in early January; each region then sets its own end date, ranging from late February to early March. The end shown here is the latest regional one.',
      de: 'In Italien gesetzlich geregelt. Die Regionenkonferenz stimmt einen gemeinsamen Start Anfang Jänner ab; das Ende legt jede Region selbst fest, von Ende Februar bis Anfang März. Angezeigt wird hier das späteste regionale Ende.',
      it: 'Regolati per legge. La Conferenza delle Regioni coordina un avvio comune a inizio gennaio; la data di chiusura la fissa ogni regione, tra fine febbraio e inizio marzo. Qui è indicata la chiusura più tarda.',
    },
    countries: ['IT'],
    region: {
      en: 'All regions except South Tyrol',
      de: 'Alle Regionen außer Südtirol',
      it: 'Tutte le regioni tranne l’Alto Adige',
    },
    categories: ['fashion', 'general', 'home'],
    season: 'winter',
    precision: 'regulated',
    start: { rule: { kind: 'nthWeekday', month: 1, weekday: 6, nth: 1 } },
    end: { durationDays: 60 },
    overrides: {
      // Confirmed: common start Saturday 3 January 2026 (Valle d'Aosta 2 Jan,
      // Liguria 5 Jan). Latest regional end is Lombardy's, 3 March.
      2026: { start: '2026-01-03', end: '2026-03-03' },
    },
    sources: [SRC.confcommercio],
  },
  {
    id: 'it-saldi-estivi',
    name: {
      en: 'Summer sales (saldi estivi)',
      de: 'Sommerschlussverkauf (saldi estivi)',
      it: 'Saldi estivi',
    },
    blurb: {
      en: 'The Conference of Regions fixed the first Saturday in July as the common national start. End dates vary by region, from August into September; the latest is shown here.',
      de: 'Die Regionenkonferenz hat den ersten Samstag im Juli als gemeinsamen nationalen Start festgelegt. Die Enddaten variieren je Region von August bis September; angezeigt wird das späteste.',
      it: 'La Conferenza delle Regioni ha fissato il primo sabato di luglio come avvio comune nazionale. Le chiusure variano per regione, da agosto a settembre; qui è indicata la più tarda.',
    },
    countries: ['IT'],
    region: {
      en: 'All regions except South Tyrol',
      de: 'Alle Regionen außer Südtirol',
      it: 'Tutte le regioni tranne l’Alto Adige',
    },
    categories: ['fashion', 'general', 'home'],
    season: 'summer',
    precision: 'regulated',
    start: { rule: { kind: 'nthWeekday', month: 7, weekday: 6, nth: 1 } },
    end: { durationDays: 60 },
    overrides: {
      // Confirmed: Saturday 4 July 2026 nationally.
      2026: { start: '2026-07-04', end: '2026-09-01' },
    },
    sources: [SRC.confcommercio],
  },

  // ─────────────────────────────────────────────────────────────────────
  // South Tyrol — its own regulated calendar, and a second one again for
  // tourist municipalities. This is the exception to everything above.
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'it-southtyrol-winter',
    name: {
      en: 'South Tyrol winter sales',
      de: 'Südtiroler Winterschlussverkauf',
      it: 'Saldi invernali Alto Adige',
    },
    blurb: {
      en: 'South Tyrol does not follow the national Italian calendar. The Bolzano Chamber of Commerce publishes its own binding four-week window for most municipalities.',
      de: 'Südtirol folgt nicht dem gesamtitalienischen Kalender. Die Handelskammer Bozen veröffentlicht für die meisten Gemeinden ein eigenes, verbindliches Vier-Wochen-Fenster.',
      it: 'L’Alto Adige non segue il calendario nazionale italiano. La Camera di commercio di Bolzano pubblica una propria finestra vincolante di quattro settimane per la maggior parte dei comuni.',
    },
    countries: ['IT'],
    region: {
      en: 'South Tyrol — non-tourist municipalities',
      de: 'Südtirol — Nicht-Tourismusgemeinden',
      it: 'Alto Adige — comuni non turistici',
    },
    categories: ['fashion', 'general', 'home'],
    season: 'winter',
    precision: 'regulated',
    start: { rule: { kind: 'nthWeekday', month: 1, weekday: 4, nth: 2 } },
    end: { durationDays: 29 },
    overrides: {
      2026: { start: '2026-01-08', end: '2026-02-05' },
    },
    sources: [SRC.bolzano],
  },
  {
    id: 'it-southtyrol-winter-tourist',
    name: {
      en: 'South Tyrol winter sales — tourist areas',
      de: 'Südtiroler Winterschlussverkauf — Tourismusgemeinden',
      it: 'Saldi invernali Alto Adige — comuni turistici',
    },
    blurb: {
      en: 'Tourist municipalities run their winter sales after the ski season instead of during it, so the window sits in March rather than January.',
      de: 'Tourismusgemeinden legen ihren Winterschlussverkauf hinter die Skisaison statt mitten hinein — das Fenster liegt daher im März statt im Jänner.',
      it: 'I comuni turistici collocano i saldi invernali dopo la stagione sciistica anziché durante, quindi la finestra cade a marzo e non a gennaio.',
    },
    countries: ['IT'],
    region: {
      en: 'South Tyrol — tourist municipalities',
      de: 'Südtirol — Tourismusgemeinden',
      it: 'Alto Adige — comuni turistici',
    },
    categories: ['fashion', 'general', 'sports'],
    season: 'spring',
    precision: 'regulated',
    start: { rule: { kind: 'nthWeekday', month: 3, weekday: 6, nth: 1 } },
    end: { durationDays: 29 },
    overrides: {
      2026: { start: '2026-03-07', end: '2026-04-04' },
    },
    sources: [SRC.bolzano],
  },
  {
    id: 'it-southtyrol-summer',
    name: {
      en: 'South Tyrol summer sales',
      de: 'Südtiroler Sommerschlussverkauf',
      it: 'Saldi estivi Alto Adige',
    },
    blurb: {
      en: 'The South Tyrolean summer window, again set by the Bolzano Chamber of Commerce and roughly two weeks later than the rest of Italy.',
      de: 'Das Südtiroler Sommerfenster, ebenfalls von der Handelskammer Bozen festgelegt und rund zwei Wochen später als im restlichen Italien.',
      it: 'La finestra estiva altoatesina, sempre fissata dalla Camera di commercio di Bolzano e circa due settimane più tardi rispetto al resto d’Italia.',
    },
    countries: ['IT'],
    region: {
      en: 'South Tyrol — non-tourist municipalities',
      de: 'Südtirol — Nicht-Tourismusgemeinden',
      it: 'Alto Adige — comuni non turistici',
    },
    categories: ['fashion', 'general', 'home'],
    season: 'summer',
    precision: 'regulated',
    start: { rule: { kind: 'nthWeekday', month: 7, weekday: 4, nth: 3 } },
    end: { durationDays: 29 },
    overrides: {
      2026: { start: '2026-07-16', end: '2026-08-13' },
    },
    sources: [SRC.bolzano],
  },
  {
    id: 'it-southtyrol-summer-tourist',
    name: {
      en: 'South Tyrol summer sales — tourist areas',
      de: 'Südtiroler Sommerschlussverkauf — Tourismusgemeinden',
      it: 'Saldi estivi Alto Adige — comuni turistici',
    },
    blurb: {
      en: 'Tourist municipalities wait until the main season is over, putting their summer sales at the end of August.',
      de: 'Tourismusgemeinden warten das Ende der Hauptsaison ab und legen ihren Sommerschlussverkauf auf Ende August.',
      it: 'I comuni turistici attendono la fine dell’alta stagione e collocano i saldi estivi a fine agosto.',
    },
    countries: ['IT'],
    region: {
      en: 'South Tyrol — tourist municipalities',
      de: 'Südtirol — Tourismusgemeinden',
      it: 'Alto Adige — comuni turistici',
    },
    categories: ['fashion', 'general', 'sports'],
    season: 'summer',
    precision: 'regulated',
    start: { rule: { kind: 'nthWeekday', month: 8, weekday: 5, nth: 3 } },
    end: { durationDays: 29 },
    overrides: {
      2026: { start: '2026-08-21', end: '2026-09-18' },
    },
    sources: [SRC.bolzano],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Germany & Austria — deregulated, but the old windows stuck
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'dach-wsv',
    name: {
      en: 'Winter clearance (WSV)',
      de: 'Winterschlussverkauf (WSV)',
      it: 'Saldi invernali (WSV)',
    },
    blurb: {
      en: 'Fixed by law until 2004 to the last week of January and first week of February. The rule is gone, but shoppers still expect it and most retailers still deliver it.',
      de: 'Bis 2004 gesetzlich auf die letzte Jänner- und erste Februarwoche festgelegt. Die Vorschrift ist weg, aber die Kundschaft erwartet den Termin weiterhin — und die meisten Händler halten ihn.',
      it: 'Fissato per legge fino al 2004 all’ultima settimana di gennaio e alla prima di febbraio. La norma non c’è più, ma i clienti se lo aspettano e la maggior parte dei negozi lo mantiene.',
    },
    countries: ['AT', 'DE'],
    categories: ['fashion', 'general', 'home'],
    season: 'winter',
    precision: 'traditional',
    start: { rule: { kind: 'nthWeekday', month: 1, weekday: 1, nth: -1 } },
    end: { durationDays: 14 },
    sources: [SRC.saisonschlussverkauf, SRC.evz],
  },
  {
    id: 'dach-ssv',
    name: {
      en: 'Summer clearance (SSV)',
      de: 'Sommerschlussverkauf (SSV)',
      it: 'Saldi estivi (SSV)',
    },
    blurb: {
      en: 'The summer counterpart to the WSV — last week of July into the first week of August. Also deregulated, also still widely observed.',
      de: 'Das Sommer-Gegenstück zum WSV — letzte Juliwoche bis in die erste Augustwoche. Ebenfalls dereguliert, ebenfalls weiterhin weitgehend üblich.',
      it: 'La controparte estiva del WSV — ultima settimana di luglio e prima di agosto. Anch’esso deregolamentato, anch’esso ancora ampiamente seguito.',
    },
    countries: ['AT', 'DE'],
    categories: ['fashion', 'general', 'home'],
    season: 'summer',
    precision: 'traditional',
    start: { rule: { kind: 'nthWeekday', month: 7, weekday: 1, nth: -1 } },
    end: { durationDays: 14 },
    sources: [SRC.saisonschlussverkauf, SRC.evz],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Switzerland — never regulated, and it shows: sales start earlier
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'ch-winter-sale',
    name: {
      en: 'Swiss winter sale (Ausverkauf)',
      de: 'Winterausverkauf',
      it: 'Saldi invernali svizzeri',
    },
    blurb: {
      en: 'Switzerland has never regulated sale periods, so retailers open the winter sale right after Christmas rather than waiting for late January.',
      de: 'Die Schweiz hat Ausverkaufszeiten nie geregelt — der Winterausverkauf startet daher direkt nach Weihnachten statt erst Ende Jänner.',
      it: 'La Svizzera non ha mai regolamentato i periodi di saldo, quindi i negozi aprono i saldi invernali subito dopo Natale invece di attendere fine gennaio.',
    },
    countries: ['CH'],
    categories: ['fashion', 'general', 'home'],
    season: 'winter',
    precision: 'traditional',
    start: { rule: { kind: 'fixed', month: 1, day: 2 } },
    end: { durationDays: 30 },
    sources: [SRC.evz],
  },
  {
    id: 'ch-summer-sale',
    name: {
      en: 'Swiss summer sale (Ausverkauf)',
      de: 'Sommerausverkauf',
      it: 'Saldi estivi svizzeri',
    },
    blurb: {
      en: 'Swiss summer sales typically open in the second half of June — several weeks ahead of the German and Austrian SSV.',
      de: 'Der Schweizer Sommerausverkauf startet meist in der zweiten Junihälfte — mehrere Wochen vor dem deutschen und österreichischen SSV.',
      it: 'I saldi estivi svizzeri iniziano di solito nella seconda metà di giugno — diverse settimane prima del SSV tedesco e austriaco.',
    },
    countries: ['CH'],
    categories: ['fashion', 'general', 'home'],
    season: 'summer',
    precision: 'traditional',
    start: { rule: { kind: 'fixed', month: 6, day: 15 } },
    end: { rule: { kind: 'fixed', month: 7, day: 27 } },
    sources: [SRC.evz],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Season turnover and holiday-driven retail
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'post-christmas-sales',
    name: {
      en: 'Post-Christmas clearance',
      de: 'Weihnachtsräumung',
      it: 'Saldi post-natalizi',
    },
    blurb: {
      en: 'Christmas stock, decorations and gift sets are cleared from 27 December. The deepest discounts of the whole winter, on the narrowest selection.',
      de: 'Weihnachtsware, Dekoration und Geschenksets werden ab dem 27. Dezember abverkauft. Die höchsten Rabatte des ganzen Winters — bei der schmalsten Auswahl.',
      it: 'Merce natalizia, decorazioni e confezioni regalo vengono liquidate dal 27 dicembre. Gli sconti più alti di tutto l’inverno, sulla scelta più ristretta.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['home', 'general', 'food', 'toys'],
    season: 'winter',
    precision: 'traditional',
    start: { rule: { kind: 'fixed', month: 12, day: 27 } },
    end: { durationDays: 12 },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'advent-christmas-shopping',
    name: {
      en: 'Christmas shopping season',
      de: 'Weihnachtsgeschäft',
      it: 'Shopping natalizio',
    },
    blurb: {
      en: 'The four weeks of Advent. Not a discount period as such — prices tend to firm up — but the widest choice of the year, and the last shipping deadlines fall inside it.',
      de: 'Die vier Adventwochen. Keine Rabattzeit im engeren Sinn — die Preise ziehen eher an — aber die größte Auswahl des Jahres, und die letzten Versandtermine liegen darin.',
      it: 'Le quattro settimane dell’Avvento. Non è un periodo di sconti — i prezzi semmai salgono — ma è la scelta più ampia dell’anno, e vi cadono le ultime scadenze di spedizione.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['general', 'toys', 'food'],
    season: 'winter',
    precision: 'traditional',
    start: { rule: { kind: 'fixed', month: 12, day: 1 } },
    end: { rule: { kind: 'fixed', month: 12, day: 24 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'easter-promotions',
    name: { en: 'Easter promotions', de: 'Osteraktionen', it: 'Promozioni pasquali' },
    blurb: {
      en: 'Food, confectionery and garden goods around Easter week. Moves with Easter, so it can land anywhere between late March and late April.',
      de: 'Lebensmittel, Süßwaren und Gartenware rund um die Osterwoche. Wandert mit Ostern und kann daher zwischen Ende März und Ende April liegen.',
      it: 'Alimentari, dolciumi e articoli da giardino nella settimana di Pasqua. Si sposta con la Pasqua, quindi può cadere tra fine marzo e fine aprile.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['food', 'home', 'toys'],
    season: 'spring',
    precision: 'traditional',
    start: { rule: { kind: 'easter', offsetDays: -12 } },
    end: { rule: { kind: 'easter', offsetDays: 1 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'mid-season-sale-spring',
    name: {
      en: 'Spring mid-season sale',
      de: 'Mid-Season-Sale Frühling',
      it: 'Saldi di metà stagione — primavera',
    },
    blurb: {
      en: 'Fashion chains discount winter leftovers in March to clear floor space for the spring collection. Not an official sale period anywhere.',
      de: 'Modeketten reduzieren im März die Winterreste, um Fläche für die Frühjahrskollektion zu schaffen. Nirgends ein offizieller Ausverkaufszeitraum.',
      it: 'Le catene di abbigliamento scontano i residui invernali a marzo per liberare spazio alla collezione primaverile. Non è un periodo di saldi ufficiale.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['fashion'],
    season: 'spring',
    precision: 'retailer',
    start: { rule: { kind: 'fixed', month: 3, day: 10 } },
    end: { durationDays: 14 },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'mid-season-sale-autumn',
    name: {
      en: 'Autumn mid-season sale',
      de: 'Mid-Season-Sale Herbst',
      it: 'Saldi di metà stagione — autunno',
    },
    blurb: {
      en: 'The October counterpart: summer stock goes, autumn and winter collections come in.',
      de: 'Das Oktober-Gegenstück: Sommerware raus, Herbst- und Winterkollektion rein.',
      it: 'La controparte di ottobre: via la merce estiva, entrano le collezioni autunno-inverno.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['fashion'],
    season: 'autumn',
    precision: 'retailer',
    start: { rule: { kind: 'fixed', month: 10, day: 10 } },
    end: { durationDays: 14 },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'ski-gear-clearance',
    name: {
      en: 'Ski & winter sports clearance',
      de: 'Skiausrüstung-Abverkauf',
      it: 'Liquidazione attrezzatura sci',
    },
    blurb: {
      en: 'The best time of the year to buy skis, boots and outerwear: shops clear the season’s stock from March rather than store it over the summer.',
      de: 'Die beste Zeit im Jahr für Ski, Schuhe und Bekleidung: Die Geschäfte räumen ab März die Saisonware, statt sie über den Sommer zu lagern.',
      it: 'Il momento migliore dell’anno per sci, scarponi e abbigliamento: dai primi di marzo i negozi liquidano la merce di stagione invece di stoccarla per l’estate.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['sports', 'fashion'],
    season: 'spring',
    precision: 'traditional',
    start: { rule: { kind: 'fixed', month: 3, day: 1 } },
    end: { rule: { kind: 'fixed', month: 4, day: 15 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'garden-season-start',
    name: {
      en: 'Garden season opening',
      de: 'Gartensaison-Start',
      it: 'Apertura stagione giardinaggio',
    },
    blurb: {
      en: 'Garden centres and DIY chains run their heaviest promotions of the year as the season opens, on plants, furniture and tools.',
      de: 'Gartencenter und Baumärkte fahren zum Saisonstart ihre stärksten Aktionen des Jahres — auf Pflanzen, Möbel und Werkzeug.',
      it: 'Garden center e catene fai-da-te lanciano le promozioni più forti dell’anno all’apertura della stagione, su piante, arredi e attrezzi.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['home'],
    season: 'spring',
    precision: 'retailer',
    start: { rule: { kind: 'fixed', month: 3, day: 15 } },
    end: { rule: { kind: 'fixed', month: 5, day: 15 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'back-to-school',
    name: { en: 'Back to school', de: 'Schulstart', it: 'Rientro a scuola' },
    blurb: {
      en: 'Stationery, school bags, laptops and children’s clothing, timed to the start of the school year.',
      de: 'Schreibwaren, Schultaschen, Laptops und Kinderbekleidung, abgestimmt auf den Schulbeginn.',
      it: 'Cancelleria, zaini, portatili e abbigliamento per bambini, in vista dell’inizio dell’anno scolastico.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['toys', 'electronics', 'fashion', 'general'],
    season: 'autumn',
    precision: 'retailer',
    start: { rule: { kind: 'fixed', month: 8, day: 15 } },
    end: { rule: { kind: 'fixed', month: 9, day: 10 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'spargelzeit',
    name: { en: 'Asparagus season', de: 'Spargelzeit', it: 'Stagione degli asparagi' },
    blurb: {
      en: 'Not a discount campaign but a real seasonal price window: white asparagus is cheapest mid-season and traditionally ends on 24 June, St John’s Day.',
      de: 'Keine Rabattaktion, sondern ein echtes saisonales Preisfenster: Spargel ist zur Saisonmitte am günstigsten und endet traditionell am 24. Juni, dem Johannistag.',
      it: 'Non una campagna di sconti ma una vera finestra stagionale di prezzo: gli asparagi bianchi costano meno a metà stagione e la raccolta finisce tradizionalmente il 24 giugno, giorno di San Giovanni.',
    },
    countries: ['AT', 'DE', 'CH'],
    categories: ['food'],
    season: 'spring',
    precision: 'traditional',
    start: { rule: { kind: 'fixed', month: 4, day: 15 } },
    end: { rule: { kind: 'fixed', month: 6, day: 24 } },
    sources: ['https://de.wikipedia.org/wiki/Spargelzeit'],
  },
  {
    id: 'early-booking-travel',
    name: {
      en: 'Early-booking travel discounts',
      de: 'Frühbucherrabatte',
      it: 'Sconti prenota prima',
    },
    blurb: {
      en: 'Tour operators discount next summer’s holidays hardest from November through March. The window closes well before spring.',
      de: 'Reiseveranstalter geben von November bis März die höchsten Rabatte auf den Sommerurlaub des Folgejahres. Das Fenster schließt deutlich vor dem Frühling.',
      it: 'I tour operator applicano gli sconti più alti sulle vacanze dell’estate successiva da novembre a marzo. La finestra si chiude ben prima della primavera.',
    },
    countries: ['AT', 'DE', 'CH'],
    categories: ['travel'],
    season: 'winter',
    precision: 'retailer',
    // Runs across the year boundary, so this must be a duration, not an end
    // rule — an end rule would resolve to 31 March of the *same* year.
    start: { rule: { kind: 'fixed', month: 11, day: 1 } },
    end: { durationDays: 151 },
    sources: [SRC.saisonschlussverkauf],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Gift days. Father's Day is a different date in all four countries —
  // worth keeping separate rather than averaging into one entry.
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'valentines-day',
    name: { en: "Valentine's Day", de: 'Valentinstag', it: 'San Valentino' },
    blurb: {
      en: 'Jewellery, perfume, flowers and confectionery. Promotions typically run the week before.',
      de: 'Schmuck, Parfum, Blumen und Süßwaren. Die Aktionen laufen meist in der Woche davor.',
      it: 'Gioielli, profumi, fiori e dolci. Le promozioni partono di solito la settimana prima.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['beauty', 'fashion', 'food'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'fixed', month: 2, day: 7 } },
    end: { rule: { kind: 'fixed', month: 2, day: 14 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'mothers-day',
    name: { en: "Mother's Day", de: 'Muttertag', it: 'Festa della mamma' },
    blurb: {
      en: 'The second Sunday in May in all four countries — one of the few gift days where they agree.',
      de: 'Der zweite Sonntag im Mai in allen vier Ländern — einer der wenigen Geschenktage, an dem sie übereinstimmen.',
      it: 'La seconda domenica di maggio in tutti e quattro i paesi — uno dei pochi giorni-regalo su cui coincidono.',
    },
    countries: ['AT', 'DE', 'CH', 'IT'],
    categories: ['beauty', 'general', 'food'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'nthWeekday', month: 5, weekday: 0, nth: 2 }, offsetDays: -6 },
    end: { rule: { kind: 'nthWeekday', month: 5, weekday: 0, nth: 2 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'fathers-day-de',
    name: { en: "Father's Day (DE)", de: 'Vatertag (DE)', it: 'Festa del papà (DE)' },
    blurb: {
      en: 'Germany ties Father’s Day to Ascension Day — Easter plus 39 days — so it moves every year.',
      de: 'Deutschland koppelt den Vatertag an Christi Himmelfahrt — Ostern plus 39 Tage — er wandert also jedes Jahr.',
      it: 'La Germania lega la festa del papà all’Ascensione — Pasqua più 39 giorni — quindi si sposta ogni anno.',
    },
    countries: ['DE'],
    categories: ['general', 'food'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'easter', offsetDays: 39 }, offsetDays: -6 },
    end: { rule: { kind: 'easter', offsetDays: 39 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'fathers-day-at',
    name: { en: "Father's Day (AT)", de: 'Vatertag (AT)', it: 'Festa del papà (AT)' },
    blurb: {
      en: 'Austria marks Father’s Day on the second Sunday in June, four weeks later than Germany usually falls.',
      de: 'Österreich begeht den Vatertag am zweiten Sonntag im Juni — meist vier Wochen nach Deutschland.',
      it: 'L’Austria celebra la festa del papà la seconda domenica di giugno, di solito quattro settimane dopo la Germania.',
    },
    countries: ['AT'],
    categories: ['general', 'food'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'nthWeekday', month: 6, weekday: 0, nth: 2 }, offsetDays: -6 },
    end: { rule: { kind: 'nthWeekday', month: 6, weekday: 0, nth: 2 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'fathers-day-ch',
    name: { en: "Father's Day (CH)", de: 'Vatertag (CH)', it: 'Festa del papà (CH)' },
    blurb: {
      en: 'Switzerland uses the first Sunday in June.',
      de: 'Die Schweiz nutzt den ersten Sonntag im Juni.',
      it: 'La Svizzera usa la prima domenica di giugno.',
    },
    countries: ['CH'],
    categories: ['general', 'food'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'nthWeekday', month: 6, weekday: 0, nth: 1 }, offsetDays: -6 },
    end: { rule: { kind: 'nthWeekday', month: 6, weekday: 0, nth: 1 } },
    sources: [SRC.saisonschlussverkauf],
  },
  {
    id: 'fathers-day-it',
    name: { en: "Father's Day (IT)", de: 'Vatertag (IT)', it: 'Festa del papà (IT)' },
    blurb: {
      en: 'Italy celebrates it on 19 March, St Joseph’s Day — a fixed date, unlike the other three.',
      de: 'Italien feiert ihn am 19. März, dem Josefstag — ein fixes Datum, anders als in den drei anderen Ländern.',
      it: 'In Italia si celebra il 19 marzo, giorno di San Giuseppe — una data fissa, a differenza degli altri tre paesi.',
    },
    countries: ['IT'],
    categories: ['general', 'food'],
    season: null,
    precision: 'retailer',
    start: { rule: { kind: 'fixed', month: 3, day: 13 } },
    end: { rule: { kind: 'fixed', month: 3, day: 19 } },
    sources: [SRC.saisonschlussverkauf],
  },
]
