import type { CategoryId, CountryCode, Lang } from '../types'

/**
 * Web Push, from the browser's side.
 *
 * Push needs a secure context, so this only works on HTTPS or localhost —
 * on the live site both hold. iOS additionally only allows push once the
 * site has been added to the home screen, which `isSupported` cannot detect
 * in advance; there the subscribe call simply fails and the UI says so.
 */

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function permission(): NotificationPermission | 'unsupported' {
  return isPushSupported() ? Notification.permission : 'unsupported'
}

/** VAPID keys travel as base64url; PushManager wants raw bytes. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalised = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(normalised)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  } catch (err) {
    console.warn('[push] service worker registration failed', err)
    return null
  }
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.getRegistration()
  return (await registration?.pushManager.getSubscription()) ?? null
}

interface SubscribeArgs {
  country: CountryCode
  lang: Lang
  categories: CategoryId[]
  leadDays: number[]
}

export type PushResult =
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'denied' | 'disabled' | 'failed' }

export async function subscribeToPush(args: SubscribeArgs): Promise<PushResult> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' }

  const keyResponse = await fetch('/api/push/key')
    .then((r) => r.json())
    .catch(() => null)
  if (!keyResponse?.enabled || !keyResponse.key) return { ok: false, reason: 'disabled' }

  // Ask only after confirming the server can actually send — a permission
  // prompt that leads nowhere is the fastest way to get blocked forever.
  const granted = await Notification.requestPermission()
  if (granted !== 'granted') return { ok: false, reason: 'denied' }

  const registration = (await registerServiceWorker()) ?? undefined
  if (!registration) return { ok: false, reason: 'failed' }
  await navigator.serviceWorker.ready

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyResponse.key) as BufferSource,
    })

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON(), ...args }),
    })
    return res.ok ? { ok: true } : { ok: false, reason: 'failed' }
  } catch (err) {
    console.warn('[push] subscribe failed', err)
    return { ok: false, reason: 'failed' }
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  const subscription = await currentSubscription()
  if (!subscription) return false

  // Tell the server first: if the browser drops it and the POST then fails,
  // the record would linger with no way to reach it again.
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => undefined)

  return subscription.unsubscribe()
}
