import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing url parameter')
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' },
      redirect: 'follow',
    })

    const contentType = response.headers.get('content-type') || 'text/html'
    let body = await response.text()

    if (contentType.includes('text/html')) {
      const origin = new URL(response.url).origin
      body = body.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`)
    }

    res.removeHeader('X-Frame-Options')
    res.removeHeader('Content-Security-Policy')
    res.setHeader('Content-Type', contentType)
    res.send(body)
  } catch (err) {
    res.status(500).send('Proxy error: ' + String(err))
  }
}
