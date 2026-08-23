/** The four countries covered so far. Adding one means adding it here, to
 *  COUNTRIES in `data/countries.ts`, and giving it events in `data/events.ts`. */
export type CountryCode = 'AT' | 'DE' | 'CH' | 'IT'

export type CategoryId =
  | 'fashion'
  | 'electronics'
  | 'food'
  | 'home'
  | 'sports'
  | 'beauty'
  | 'travel'
  | 'toys'
  | 'general'

export type Season = 'winter' | 'spring' | 'summer' | 'autumn'

export type Lang = 'en' | 'de' | 'it'

/** Every user-facing string in the dataset carries all three languages. */
export type Localized = Record<Lang, string>

/**
 * How much the dates can actually be trusted. This is the single most
 * important field in the dataset — most "sale season" information online
 * silently mixes all three, and presenting a shop custom as a legal date
 * is exactly the kind of error worth designing against.
 *
 * - `regulated`  — set by law or by an official body (Italian regions, the
 *                  Bolzano Chamber of Commerce). Dates are binding for shops.
 * - `traditional`— was regulated once, now deregulated, but retailers still
 *                  broadly follow the old window (German/Austrian WSV & SSV).
 * - `retailer`   — purely a retail/marketing event with no official date at
 *                  all (Black Friday, Prime Day). Dates are the common ones.
 */
export type Precision = 'regulated' | 'traditional' | 'retailer'

/** A rule that resolves to one calendar day in a given year. */
export type DateRule =
  /** A fixed calendar day, e.g. Singles' Day = 11 November. */
  | { kind: 'fixed'; month: number; day: number }
  /**
   * The nth given weekday of a month. `nth: 1` is the first, `nth: -1` the
   * last. Weekday is 0=Sunday .. 6=Saturday, matching `Date.getDay()`.
   */
  | { kind: 'nthWeekday'; month: number; weekday: number; nth: number }
  /** A number of days relative to Easter Sunday (negative = before). */
  | { kind: 'easter'; offsetDays: number }

/** A rule plus an optional day shift, so "the day after the 4th Thursday of
 *  November" (Black Friday) stays one expression instead of a special case. */
export interface AnchoredRule {
  rule: DateRule
  offsetDays?: number
}

/** An explicitly confirmed period for one year, overriding the rule. */
export interface YearOverride {
  /** ISO `YYYY-MM-DD`. */
  start: string
  /** ISO `YYYY-MM-DD`, inclusive. */
  end: string
}

export interface SaleEvent {
  id: string
  name: Localized
  blurb: Localized
  /** Which of the four countries this event applies to. */
  countries: CountryCode[]
  /** Set only when the event covers part of a country (e.g. South Tyrol). */
  region?: Localized
  categories: CategoryId[]
  /** `null` for events that are not tied to a season (Black Friday etc.). */
  season: Season | null
  precision: Precision
  /** Generates the period for any year the rule is asked about. */
  start: AnchoredRule
  /** Either an explicit end rule, or a length in days counted from the start. */
  end: AnchoredRule | { durationDays: number }
  /**
   * Confirmed official dates, keyed by year. These win over `start`/`end`,
   * which for regulated events are only an approximation of the usual rule.
   */
  overrides?: Record<number, YearOverride>
  /** Where the dates came from. Shown in the UI — no unsourced claims. */
  sources: string[]
}

/** A `SaleEvent` resolved to real dates for one specific year. */
export interface Occurrence {
  event: SaleEvent
  /** Local midnight on the first day. */
  start: Date
  /** Local midnight on the last day, inclusive. */
  end: Date
  /** True when the dates came from `overrides` rather than the rule. */
  confirmed: boolean
}
