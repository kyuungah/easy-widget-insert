import type { VercelRequest, VercelResponse } from '@vercel/node'
import iconv from 'iconv-lite'

function extractCharset(contentType: string, rawHtml: string): string {
  // 1. Content-Type 헤더에서 추출
  const ctMatch = contentType.match(/charset=([^\s;]+)/i)
  if (ctMatch) return ctMatch[1].toLowerCase()

  // 2. HTML meta 태그에서 추출 (앞 2000바이트만 확인)
  const head = rawHtml.slice(0, 2000)
  const metaMatch = head.match(/charset\s*=\s*["']?([a-z0-9\-_]+)/i)
  if (metaMatch) return metaMatch[1].toLowerCase()

  return 'utf-8'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url, mobile } = req.query
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing url parameter')
  }

  const userAgent = mobile === '1'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (compatible)'

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      redirect: 'follow',
    })

    const contentType = response.headers.get('content-type') || 'text/html'
    const buffer = await response.arrayBuffer()

    // charset 감지를 위해 일단 latin1(손실 없는 바이너리→문자열)로 앞부분만 디코딩
    const preview = new TextDecoder('latin1').decode(buffer.slice(0, 2000))
    const charset = extractCharset(contentType, preview)

    // iconv-lite로 실제 charset 디코딩
    let body: string
    try {
      body = iconv.decode(Buffer.from(buffer), charset)
    } catch {
      // charset 지원 안 되면 UTF-8 fallback
      body = new TextDecoder('utf-8').decode(buffer)
    }

    if (contentType.includes('text/html')) {
      const origin = new URL(response.url).origin
      body = body.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`)

      // 메타 charset 태그를 utf-8로 업데이트 (브라우저 해석 우선순위 조정)
      body = body.replace(
        /<meta[^>]+http-equiv=["']?Content-Type["']?[^>]+charset=[^"'>\s]+/i,
        (match) => match.replace(/charset=[^"'>\s]+/i, 'charset=utf-8')
      )
      // 다른 형식의 메타 charset도 수정
      body = body.replace(
        /<meta[^>]+charset\s*=\s*["']?[^"'>\s]+/i,
        (match) => match.replace(/charset\s*=\s*["']?[^"'>\s]+/i, 'charset=utf-8')
      )
    }

    res.removeHeader('X-Frame-Options')
    res.removeHeader('Content-Security-Policy')
    // 항상 UTF-8로 응답 (브라우저가 올바르게 렌더링)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(body)
  } catch (err) {
    res.status(500).send('Proxy error: ' + String(err))
  }
}
