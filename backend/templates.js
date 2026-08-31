/**
 * Subject and body for every outbound email, in all three languages.
 * Same rule as the frontend: nothing user-facing ships in English only.
 */

const T = {
  confirmSubject: {
    en: 'Confirm your Sale Season reminders',
    de: 'Bestätige deine Sale-Season-Erinnerungen',
    it: 'Conferma i tuoi promemoria di Sale Season',
  },
  confirmIntro: {
    en: 'Almost there. Confirm below and you will get an email before each sale starts.',
    de: 'Fast geschafft. Bestätige unten und du bekommst vor jedem Sale-Start eine E-Mail.',
    it: "Ci siamo quasi. Conferma qui sotto e riceverai un'email prima di ogni saldo.",
  },
  confirmCta: {
    en: 'Confirm my reminders',
    de: 'Erinnerungen bestätigen',
    it: 'Conferma i promemoria',
  },
  confirmIgnore: {
    en: 'If you did not sign up, ignore this email — nothing more will be sent.',
    de: 'Falls du dich nicht angemeldet hast, ignoriere diese E-Mail — es folgt nichts weiter.',
    it: 'Se non ti sei registrato, ignora questa email — non verrà inviato altro.',
  },
  reminderIntro: {
    en: 'Here is what is about to start:',
    de: 'Das steht als Nächstes an:',
    it: 'Ecco cosa sta per iniziare:',
  },
  startsTomorrow: { en: 'starts tomorrow', de: 'startet morgen', it: 'inizia domani' },
  startsInDays: {
    en: 'starts in {n} days',
    de: 'startet in {n} Tagen',
    it: 'inizia tra {n} giorni',
  },
  subjectMany: {
    en: '{n} sales starting soon',
    de: '{n} Sales starten demnächst',
    it: '{n} saldi in arrivo',
  },
  estimated: {
    en: 'estimated — official dates not published yet',
    de: 'geschätzt — offizielle Termine noch nicht veröffentlicht',
    it: 'stimata — date ufficiali non ancora pubblicate',
  },
  confirmedDates: {
    en: 'confirmed dates',
    de: 'bestätigte Termine',
    it: 'date confermate',
  },
  openCalendar: {
    en: 'Open the calendar',
    de: 'Kalender öffnen',
    it: 'Apri il calendario',
  },
  manage: {
    en: 'Change what you get',
    de: 'Einstellungen ändern',
    it: 'Modifica le preferenze',
  },
  unsubscribe: {
    en: 'Stop these reminders',
    de: 'Diese Erinnerungen abbestellen',
    it: 'Interrompi questi promemoria',
  },
  pageConfirmedTitle: {
    en: 'You are subscribed',
    de: 'Anmeldung bestätigt',
    it: 'Iscrizione confermata',
  },
  pageConfirmedBody: {
    en: 'You will get an email before each sale starts.',
    de: 'Du bekommst vor jedem Sale-Start eine E-Mail.',
    it: "Riceverai un'email prima dell'inizio di ogni saldo.",
  },
  pageUnsubTitle: { en: 'Unsubscribed', de: 'Abgemeldet', it: 'Disiscritto' },
  pageUnsubBody: {
    en: 'You will not receive any more reminders.',
    de: 'Du erhältst keine weiteren Erinnerungen.',
    it: 'Non riceverai più promemoria.',
  },
  pageInvalidTitle: {
    en: 'Link no longer valid',
    de: 'Link nicht mehr gültig',
    it: 'Link non più valido',
  },
  pageInvalidBody: {
    en: 'This link has already been used or has expired.',
    de: 'Dieser Link wurde bereits verwendet oder ist abgelaufen.',
    it: 'Questo link è già stato usato o è scaduto.',
  },
}

export function t(key, lang, vars = {}) {
  const table = T[key]
  const raw = (table && (table[lang] ?? table.en)) ?? key
  return raw.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '')
}

/** Numeric on purpose: month names would need a fourth translation table. */
export function formatRange(start, end, lang) {
  const fmt = (iso) => {
    const [y, m, d] = iso.split('-')
    return lang === 'en' ? `${d}/${m}/${y}` : `${d}.${m}.${y}`
  }
  return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`
}

export function leadPhrase(lead, lang) {
  return lead <= 1 ? t('startsTomorrow', lang) : t('startsInDays', lang, { n: lead })
}

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ENTITIES[c])
}

function shell(inner) {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#0b0d14;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#e7eaf1">
<div style="max-width:560px;margin:0 auto;background:#11141d;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:28px">
<div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:20px">Sale Season</div>
${inner}
</div></body></html>`
}

function button(href, label) {
  return (
    `<a href="${escapeHtml(href)}" style="display:inline-block;background:#f59e0b;color:#0b0d14;` +
    `font-weight:700;text-decoration:none;padding:12px 20px;border-radius:10px">${escapeHtml(label)}</a>`
  )
}

export function confirmEmail({ lang, confirmUrl }) {
  const text = [t('confirmIntro', lang), '', confirmUrl, '', t('confirmIgnore', lang)].join('\n')

  const html = shell(
    `<p style="font-size:15px;line-height:1.6;margin:0 0 24px">${escapeHtml(t('confirmIntro', lang))}</p>` +
      `<p style="margin:0 0 24px">${button(confirmUrl, t('confirmCta', lang))}</p>` +
      `<p style="font-size:12px;color:#6b7285;line-height:1.6;margin:0">${escapeHtml(t('confirmIgnore', lang))}</p>`,
  )

  return { subject: t('confirmSubject', lang), text, html }
}

export function reminderEmail({ lang, items, siteUrl, unsubscribeUrl, manageUrl }) {
  const subject =
    items.length === 1
      ? `${items[0].name} ${leadPhrase(items[0].lead, lang)}`
      : t('subjectMany', lang, { n: items.length })

  const plainLine = (i) => {
    const note = i.confirmed ? '' : ` [${t('estimated', lang)}]`
    return `${i.name} — ${leadPhrase(i.lead, lang)} (${formatRange(i.start, i.end, lang)})${note}`
  }

  const text = [
    t('reminderIntro', lang),
    '',
    ...items.map((i) => `- ${plainLine(i)}`),
    '',
    siteUrl,
    '',
    `${t('manage', lang)}: ${manageUrl}`,
    `${t('unsubscribe', lang)}: ${unsubscribeUrl}`,
  ].join('\n')

  const rows = items
    .map((i) => {
      const note = i.confirmed ? t('confirmedDates', lang) : t('estimated', lang)
      return `<tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.07)">
<div style="font-size:16px;font-weight:600;color:#fff">${escapeHtml(i.name)}</div>
<div style="font-size:13px;color:#fbbf24;margin-top:2px">${escapeHtml(leadPhrase(i.lead, lang))}</div>
<div style="font-size:12px;color:#9aa1b4;margin-top:4px">${escapeHtml(formatRange(i.start, i.end, lang))} &middot; ${escapeHtml(note)}</div>
</td></tr>`
    })
    .join('')

  const html = shell(
    `<p style="font-size:15px;line-height:1.6;margin:0 0 8px">${escapeHtml(t('reminderIntro', lang))}</p>` +
      `<table style="width:100%;border-collapse:collapse;margin-bottom:24px">${rows}</table>` +
      `<p style="margin:0 0 24px">${button(siteUrl, t('openCalendar', lang))}</p>` +
      `<p style="font-size:12px;color:#6b7285;margin:0">` +
      `<a href="${escapeHtml(manageUrl)}" style="color:#6b7285">${escapeHtml(t('manage', lang))}</a>` +
      ` &middot; ` +
      `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#6b7285">${escapeHtml(t('unsubscribe', lang))}</a></p>`,
  )

  return { subject, text, html }
}

const MANAGE = {
  title: {
    en: 'Your reminders',
    de: 'Deine Erinnerungen',
    it: 'I tuoi promemoria',
  },
  lead: { en: 'Remind me', de: 'Erinnere mich', it: 'Avvisami' },
  leadDays: { en: '{n} days before', de: '{n} Tage vorher', it: '{n} giorni prima' },
  leadOne: { en: '1 day before', de: '1 Tag vorher', it: '1 giorno prima' },
  categories: {
    en: 'Only these categories (none = everything)',
    de: 'Nur diese Kategorien (keine = alles)',
    it: 'Solo queste categorie (nessuna = tutto)',
  },
  save: { en: 'Save changes', de: 'Änderungen speichern', it: 'Salva modifiche' },
  saved: { en: 'Saved.', de: 'Gespeichert.', it: 'Salvato.' },
  unsubHint: {
    en: 'Or stop the reminders entirely:',
    de: 'Oder die Erinnerungen ganz beenden:',
    it: 'Oppure interrompi del tutto i promemoria:',
  },
}

const LEAD_CHOICES = [14, 7, 3, 1]

/** Server-rendered preferences form, reached from the link in every email. */
export function managePage({ sub, lang, siteUrl, categories, saved }) {
  const chosen = new Set(sub.categories)
  const leads = new Set(sub.leadDays)

  const leadInputs = LEAD_CHOICES.map((n) => {
    const label = n === 1 ? MANAGE.leadOne[lang] ?? MANAGE.leadOne.en : (MANAGE.leadDays[lang] ?? MANAGE.leadDays.en).replace('{n}', n)
    return `<label style="display:inline-flex;align-items:center;gap:6px;margin:0 14px 8px 0">
<input type="checkbox" name="leadDays" value="${n}" ${leads.has(n) ? 'checked' : ''}> ${escapeHtml(label)}</label>`
  }).join('')

  const categoryInputs = categories
    .map(
      (c) => `<label style="display:inline-flex;align-items:center;gap:6px;margin:0 14px 8px 0">
<input type="checkbox" name="categories" value="${escapeHtml(c.id)}" ${chosen.has(c.id) ? 'checked' : ''}> ${escapeHtml(c.name[lang] ?? c.name.en)}</label>`,
    )
    .join('')

  const unsubUrl = `${siteUrl}/api/unsubscribe?token=${encodeURIComponent(sub.unsubscribeToken)}`

  return `<!doctype html><html lang="${escapeHtml(lang)}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(MANAGE.title[lang] ?? MANAGE.title.en)} — Sale Season</title></head>
<body style="margin:0;min-height:100vh;background:#07080c;color:#e7eaf1;padding:24px;
font-family:-apple-system,Segoe UI,Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto">
<h1 style="font-size:22px;color:#fff;margin:0 0 4px">${escapeHtml(MANAGE.title[lang] ?? MANAGE.title.en)}</h1>
<p style="color:#9aa1b4;margin:0 0 20px;font-size:14px">${escapeHtml(sub.email)}</p>
${saved ? `<p style="color:#6ee7b7;font-weight:600;margin:0 0 16px">${escapeHtml(MANAGE.saved[lang] ?? MANAGE.saved.en)}</p>` : ''}
<form method="post" action="/api/manage">
<input type="hidden" name="token" value="${escapeHtml(sub.unsubscribeToken)}">
<h2 style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#6b7285;margin:20px 0 10px">${escapeHtml(MANAGE.lead[lang] ?? MANAGE.lead.en)}</h2>
${leadInputs}
<h2 style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#6b7285;margin:20px 0 10px">${escapeHtml(MANAGE.categories[lang] ?? MANAGE.categories.en)}</h2>
${categoryInputs}
<p style="margin:24px 0 0"><button type="submit" style="background:#f59e0b;color:#0b0d14;font-weight:700;
border:0;padding:12px 20px;border-radius:10px;font-size:15px;cursor:pointer">${escapeHtml(MANAGE.save[lang] ?? MANAGE.save.en)}</button></p>
</form>
<p style="margin:28px 0 0;font-size:12px;color:#6b7285">${escapeHtml(MANAGE.unsubHint[lang] ?? MANAGE.unsubHint.en)}
<a href="${escapeHtml(unsubUrl)}" style="color:#6b7285">${escapeHtml(t('unsubscribe', lang))}</a></p>
</div></body></html>`
}

const PAGE_KEYS = {
  confirmed: ['pageConfirmedTitle', 'pageConfirmedBody'],
  unsubscribed: ['pageUnsubTitle', 'pageUnsubBody'],
  invalid: ['pageInvalidTitle', 'pageInvalidBody'],
}

export function landingPage(kind, lang, siteUrl) {
  const [titleKey, bodyKey] = PAGE_KEYS[kind]
  return `<!doctype html><html lang="${escapeHtml(lang)}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(t(titleKey, lang))} — Sale Season</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
background:#07080c;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#e7eaf1;padding:24px">
<div style="max-width:420px;text-align:center">
<h1 style="font-size:24px;margin:0 0 8px;color:#fff">${escapeHtml(t(titleKey, lang))}</h1>
<p style="color:#9aa1b4;line-height:1.6;margin:0 0 24px">${escapeHtml(t(bodyKey, lang))}</p>
<a href="${escapeHtml(siteUrl)}" style="color:#fbbf24">${escapeHtml(t('openCalendar', lang))}</a>
</div></body></html>`
}
