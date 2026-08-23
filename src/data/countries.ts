import type { CountryCode, Localized } from '../types'

export interface CountryMeta {
  code: CountryCode
  flag: string
  name: Localized
  /** Locale used to format dates when this country is selected. */
  locale: string
}

export const COUNTRIES: CountryMeta[] = [
  {
    code: 'AT',
    flag: '🇦🇹',
    locale: 'de-AT',
    name: { en: 'Austria', de: 'Österreich', it: 'Austria' },
  },
  {
    code: 'DE',
    flag: '🇩🇪',
    locale: 'de-DE',
    name: { en: 'Germany', de: 'Deutschland', it: 'Germania' },
  },
  {
    code: 'CH',
    flag: '🇨🇭',
    locale: 'de-CH',
    name: { en: 'Switzerland', de: 'Schweiz', it: 'Svizzera' },
  },
  {
    code: 'IT',
    flag: '🇮🇹',
    locale: 'it-IT',
    name: { en: 'Italy', de: 'Italien', it: 'Italia' },
  },
]

export const COUNTRY_BY_CODE = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
) as Record<CountryCode, CountryMeta>
