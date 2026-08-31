/**
 * Generate a VAPID key pair for Web Push, once.
 *
 *   node generate-vapid.js
 *
 * Paste the output into .env. Rotating these invalidates every existing
 * push subscription, so generate them once and keep them.
 */
import webpush from 'web-push'

const { publicKey, privateKey } = webpush.generateVAPIDKeys()

console.log('\nAdd these to your .env:\n')
console.log(`VAPID_PUBLIC_KEY=${publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${privateKey}`)
console.log('\nKeep VAPID_PRIVATE_KEY secret. The public key is served to browsers.\n')
