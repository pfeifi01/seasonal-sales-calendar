import webpush from 'web-push'
import { removePushSubscription } from './store.js'

/**
 * Web Push delivery.
 *
 * VAPID keys identify this server to the browser push services. Generate a
 * pair once with `node generate-vapid.js` and keep them in .env — rotating
 * them invalidates every existing subscription, so they are not disposable.
 *
 * Push is optional: with no keys configured the endpoints report themselves
 * unavailable and the frontend hides the option, rather than the server
 * refusing to boot the way it does for missing SMTP. Email is the baseline
 * feature; push is the extra.
 */

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:seasonal.sales.tracking@gmail.com'

export const pushEnabled = Boolean(PUBLIC_KEY && PRIVATE_KEY)

if (pushEnabled) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY)
} else {
  console.warn('[push] VAPID keys not set — push notifications are disabled')
}

export function publicKey() {
  return PUBLIC_KEY
}

/**
 * Deliver one notification.
 *
 * A 404 or 410 means the browser has thrown the subscription away — the app
 * was uninstalled, or permission revoked. Those are dropped rather than
 * retried forever, which is the whole maintenance story for push.
 */
export async function sendPush(record, payload) {
  if (!pushEnabled) return { skipped: true }

  const subscription = { endpoint: record.endpoint, keys: record.keys }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return { ok: true }
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      removePushSubscription(record.endpoint)
      console.log(`[push] dropped expired subscription ${record.id}`)
      return { expired: true }
    }
    throw err
  }
}
