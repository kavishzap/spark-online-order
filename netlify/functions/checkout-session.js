import { verifyCheckoutSession } from '../../api/lib/checkoutSession.js'

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('s')

  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing session token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const session = verifyCheckoutSession(token, process.env)
  if (!session) {
    return new Response(
      JSON.stringify({
        error: 'Invalid or expired checkout link. Open the store again from WhatsApp.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(JSON.stringify(session), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
