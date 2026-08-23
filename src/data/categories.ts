import type { CategoryId, Localized, Season } from '../types'

export interface CategoryMeta {
  id: CategoryId
  icon: string
  name: Localized
  /** Base hue used for the event bar, chip and dot. */
  color: string
}

/** Colours are chosen to stay distinguishable side by side on a dark ground
 *  and when drawn as thin 4px bars in the year timeline. */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'fashion',
    icon: '👗',
    color: '#f43f5e',
    name: { en: 'Clothing', de: 'Kleidung', it: 'Abbigliamento' },
  },
  {
    id: 'electronics',
    icon: '💻',
    color: '#22d3ee',
    name: { en: 'Electronics', de: 'Elektronik', it: 'Elettronica' },
  },
  {
    id: 'food',
    icon: '🍎',
    color: '#84cc16',
    name: { en: 'Food & Drink', de: 'Essen & Trinken', it: 'Cibo e bevande' },
  },
  {
    id: 'home',
    icon: '🛋️',
    color: '#f59e0b',
    name: { en: 'Home & Garden', de: 'Haus & Garten', it: 'Casa e giardino' },
  },
  {
    id: 'sports',
    icon: '⛷️',
    color: '#8b5cf6',
    name: { en: 'Sports & Outdoor', de: 'Sport & Outdoor', it: 'Sport e outdoor' },
  },
  {
    id: 'beauty',
    icon: '💄',
    color: '#d946ef',
    name: { en: 'Beauty', de: 'Beauty', it: 'Bellezza' },
  },
  {
    id: 'travel',
    icon: '✈️',
    color: '#0ea5e9',
    name: { en: 'Travel', de: 'Reisen', it: 'Viaggi' },
  },
  {
    id: 'toys',
    icon: '🧸',
    color: '#fb923c',
    name: { en: 'Toys & Kids', de: 'Spielzeug & Kinder', it: 'Giocattoli e bambini' },
  },
  {
    id: 'general',
    icon: '🏷️',
    color: '#94a3b8',
    name: { en: 'Everything', de: 'Alles', it: 'Tutto' },
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryMeta>

export interface SeasonMeta {
  id: Season
  icon: string
  name: Localized
}

export const SEASONS: SeasonMeta[] = [
  { id: 'winter', icon: '❄️', name: { en: 'Winter', de: 'Winter', it: 'Inverno' } },
  { id: 'spring', icon: '🌱', name: { en: 'Spring', de: 'Frühling', it: 'Primavera' } },
  { id: 'summer', icon: '☀️', name: { en: 'Summer', de: 'Sommer', it: 'Estate' } },
  { id: 'autumn', icon: '🍂', name: { en: 'Autumn', de: 'Herbst', it: 'Autunno' } },
]
