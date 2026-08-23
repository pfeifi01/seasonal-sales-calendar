import type { Lang, Precision } from '../types'
import { makeTranslator, type StringKey } from '../i18n'

const STYLES: Record<Precision, string> = {
  regulated: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  traditional: 'border-tag-400/30 bg-tag-400/10 text-tag-300',
  retailer: 'border-ink-500/40 bg-white/[0.04] text-ink-300',
}

const ICONS: Record<Precision, string> = {
  regulated: '⚖️',
  traditional: '🕰️',
  retailer: '🏷️',
}

interface Props {
  precision: Precision
  lang: Lang
  withHelp?: boolean
}

/**
 * Shows whether a period is legally binding, merely traditional, or pure
 * marketing. Deliberately prominent — conflating the three is the main way
 * sale-date listings mislead people.
 */
export default function PrecisionBadge({ precision, lang, withHelp = false }: Props) {
  const t = makeTranslator(lang)
  const label = t(`precision.${precision}` as StringKey)

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STYLES[precision]}`}
      >
        <span aria-hidden="true">{ICONS[precision]}</span>
        {label}
      </span>
      {withHelp && (
        <span className="text-xs leading-relaxed text-ink-400">
          {t(`precision.${precision}.help` as StringKey)}
        </span>
      )}
    </div>
  )
}
