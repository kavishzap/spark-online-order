import { verifyCheckoutSession } from './lib/checkoutSession.js'

/**
 * Verify signed checkout session from WhatsApp store link (?s=...).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.query?.s
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Missing session token' })
  }

  const session = verifyCheckoutSession(token)
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired checkout link. Open the store again from WhatsApp.' })
  }

  return res.status(200).json(session)
}
