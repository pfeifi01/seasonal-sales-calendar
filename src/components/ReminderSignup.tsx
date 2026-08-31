import { useEffect, useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { COUNTRY_BY_CODE } from '../data/countries'
import { loc, makeTranslator, type StringKey } from '../i18n'
import {
  currentSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '../lib/push'
import type { CategoryId, CountryCode, Lang } from '../types'

interface Props {
  lang: Lang
  country: CountryCode
  /** Categories to preselect, set when arriving from a specific sale. */
  preset: CategoryId[] | null
}

const LEAD_OPTIONS = [14, 7, 3, 1]

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'updated' }
  | { kind: 'error'; code: string }

export default function ReminderSignup({ lang, country, preset }: Props) {
  const t = makeTranslator(lang)
  const [email, setEmail] = useState('')
  const [leadDays, setLeadDays] = useState<number[]>([7, 1])
  const [categories, setCategories] = useState<Set<CategoryId>>(new Set())
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const [pushSupported] = useState(isPushSupported)
  const [pushOn, setPushOn] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [pushError, setPushError] = useState<string | null>(null)

  // Follows the drawer's "Notify me", which jumps here with a sale's own
  // categories. Still fully editable afterwards — this only seeds it.
  useEffect(() => {
    if (preset) setCategories(new Set(preset))
  }, [preset])

  // Reflect whatever this device already has, so the button does not offer
  // to enable push that is in fact already on.
  useEffect(() => {
    if (!pushSupported) return
    currentSubscription().then((sub) => setPushOn(Boolean(sub)))
  }, [pushSupported])

  async function enablePush() {
    setPushBusy(true)
    setPushError(null)
    const result = await subscribeToPush({
      country,
      lang,
      categories: [...categories],
      leadDays: leadDays.length > 0 ? leadDays : [7, 1],
    })
    setPushBusy(false)
    if (result.ok) setPushOn(true)
    else setPushError(result.reason)
  }

  async function disablePush() {
    setPushBusy(true)
    setPushError(null)
    await unsubscribeFromPush()
    setPushBusy(false)
    setPushOn(false)
  }

  function toggleLead(n: number) {
    setLeadDays((prev) =>
      prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n].sort((a, b) => b - a),
    )
  }

  function toggleCategory(id: CategoryId) {
    setCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus({ kind: 'sending' })

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          country,
          lang,
          categories: [...categories],
          // An empty selection would mean "never remind me", which is never
          // what someone filling in this form wants.
          leadDays: leadDays.length > 0 ? leadDays : [7, 1],
        }),
      })
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus({ kind: 'error', code: body.error ?? 'generic' })
        return
      }
      setStatus({ kind: body.status === 'updated' ? 'updated' : 'sent' })
      setEmail('')
    } catch {
      setStatus({ kind: 'error', code: 'generic' })
    }
  }

  const errorKey: StringKey =
    status.kind === 'error' &&
    ['invalid_email', 'too_many_requests', 'email_failed'].includes(status.code)
      ? (`notify.error.${status.code}` as StringKey)
      : 'notify.error.generic'

  return (
    <section id="reminders" className="panel p-5 sm:p-6 scroll-mt-6">
      <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-xl font-bold text-heading">
          🔔 {t('notify.title')}
        </h2>
        <span className="text-sm text-ink-400">
          {t('notify.forCountry')} {COUNTRY_BY_CODE[country].flag}{' '}
          {loc(COUNTRY_BY_CODE[country].name, lang)}
        </span>
      </div>
      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-ink-300">
        {t('notify.subtitle')}
      </p>

      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              {t('notify.email')}
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border border-line bg-ink-950/60 px-3 py-2.5 text-sm
                         text-ink-100 placeholder:text-ink-500
                         focus:border-tag-400/40 focus:outline-none focus:ring-1 focus:ring-tag-400/40"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              {t('notify.lead')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LEAD_OPTIONS.map((n) => {
                const active = leadDays.includes(n)
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleLead(n)}
                    aria-pressed={active}
                    className={`chip ${
                      active ? 'border-tag-400/50 bg-tag-400/15 text-tag-200' : 'chip-off'
                    }`}
                  >
                    {n === 1 ? t('notify.leadOneDay') : t('notify.leadDays', { n })}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {t('notify.categoriesOptional')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => {
              const active = categories.has(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  aria-pressed={active}
                  className={`chip ${active ? 'text-heading' : 'chip-off'}`}
                  style={
                    active
                      ? { borderColor: `${c.color}66`, backgroundColor: `${c.color}22` }
                      : undefined
                  }
                >
                  <span aria-hidden="true">{c.icon}</span>
                  {loc(c.name, lang)}
                </button>
              )
            })}
          </div>
          <span className="text-xs text-ink-500">{t('notify.allCategories')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={status.kind === 'sending'}
            className="rounded-xl bg-tag-500 px-5 py-2.5 text-sm font-bold text-on-accent
                       transition-colors hover:bg-tag-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.kind === 'sending' ? t('notify.sending') : t('notify.submit')}
          </button>

          <p aria-live="polite" className="text-sm">
            {status.kind === 'sent' && (
              <span className="font-medium text-emerald-300">✓ {t('notify.sent')}</span>
            )}
            {status.kind === 'updated' && (
              <span className="font-medium text-emerald-300">✓ {t('notify.updated')}</span>
            )}
            {status.kind === 'error' && (
              <span className="font-medium text-rose-300">{t(errorKey)}</span>
            )}
          </p>
        </div>

        <p className="text-xs leading-relaxed text-ink-500">{t('notify.privacy')}</p>
      </form>

      {/* Push reuses the lead times and categories chosen above rather than
          asking for them a second time. */}
      {pushSupported && (
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="font-display text-base font-semibold text-heading">
            📲 {t('push.title')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-400">
            {t('push.subtitle')}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={pushOn ? disablePush : enablePush}
              disabled={pushBusy}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors
                          disabled:cursor-not-allowed disabled:opacity-60 ${
                            pushOn
                              ? 'border border-line bg-surface text-ink-200 hover:bg-surface-2'
                              : 'bg-tag-500 text-on-accent hover:bg-tag-400'
                          }`}
            >
              {pushBusy
                ? t('push.working')
                : pushOn
                  ? t('push.disable')
                  : t('push.enable')}
            </button>

            <p aria-live="polite" className="text-sm">
              {pushOn && !pushError && (
                <span className="font-medium text-emerald-300">✓ {t('push.enabled')}</span>
              )}
              {pushError && (
                <span className="font-medium text-rose-300">
                  {t(`push.error.${pushError}` as StringKey)}
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
