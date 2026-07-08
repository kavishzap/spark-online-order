import { createHmac, timingSafeEqual } from 'node:crypto'
import { normalizePhone } from '../../src/utils/phone.js'

function getSecret(source = process.env) {
  return (
    source.SODAMAX_CHECKOUT_SESSION_SECRET?.trim() ||
    source.CHECKOUT_SESSION_SECRET?.trim() ||
    ''
  )
}

export function verifyCheckoutSession(token, source = process.env) {
  const secret = getSecret(source)
  if (!secret) return null

  const parts = String(token || '').split('.')
  if (parts.length !== 2) return null

  const [encoded, sig] = parts
  if (!encoded || !sig) return null

  const expected = createHmac('sha256', secret).update(encoded).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
    if (!payload.phone || typeof payload.exp !== 'number') return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null

    return {
      phone: normalizePhone(payload.phone),
      name: payload.name?.trim() || null,
      exp: payload.exp,
    }
  } catch {
    return null
  }
}
