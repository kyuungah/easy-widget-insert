import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

declare const Buffer: any

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

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'proxy-middleware',
      async configureServer(server) {
        // iconv-lite를 async로 동적 import (ESM 환경 대응)
        let iconv: any = null
        try {
          const mod = await import('iconv-lite')
          iconv = mod.default ?? mod
          console.log('[vite-proxy] iconv-lite loaded successfully')
        } catch (e) {
          console.warn('[vite-proxy] iconv-lite not available:', e)
        }

        server.middlewares.use('/api/proxy', async (req, res) => {
          try {
            const params = new URL(`http://dummy${req.url}`).searchParams
            const targetUrl = params.get('url')
            if (!targetUrl) {
              res.statusCode = 400
              res.end('Missing url parameter')
              return
            }

            const mobile = params.get('mobile') === '1'
            const userAgent = mobile
              ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
              : 'Mozilla/5.0 (compatible)'

            const response = await fetch(targetUrl, {
              headers: { 'User-Agent': userAgent },
              redirect: 'follow',
            })

            const contentType = response.headers.get('content-type') || 'text/html'
            const buffer = await response.arrayBuffer()

            // charset 감지를 위해 일단 latin1(손실 없는 바이너리→문자열)로 앞부분만 디코딩
            const preview = new TextDecoder('latin1').decode(buffer.slice(0, 2000))
            const charset = extractCharset(contentType, preview)

            console.log('[proxy] URL:', targetUrl)
            console.log('[proxy] Content-Type:', contentType)
            console.log('[proxy] Detected charset:', charset)
            console.log('[proxy] Buffer size:', buffer.byteLength)

            // 실제 charset으로 디코딩
            let body: string
            if (iconv && charset !== 'utf-8') {
              try {
                body = iconv.decode(Buffer.from(buffer), charset)
                console.log('[proxy] Decoded successfully with iconv-lite:', charset)
              } catch (error) {
                console.log('[proxy] iconv decode error, falling back to UTF-8:', error)
                body = new TextDecoder('utf-8').decode(buffer)
              }
            } else if (charset !== 'utf-8' && !iconv) {
              // iconv not available but charset is not utf-8 - text may be garbled
              console.warn(
                '[proxy] Warning: iconv-lite not available, cannot decode',
                charset,
                '- text may be garbled. Run: yarn add -D iconv-lite'
              )
              body = new TextDecoder('utf-8').decode(buffer)
            } else {
              // charset is utf-8, use TextDecoder
              body = new TextDecoder('utf-8').decode(buffer)
              console.log('[proxy] Decoded with TextDecoder (charset=utf-8)')
            }
            console.log('[proxy] Decoded body length:', body.length)

            // 한글 텍스트가 있는 부분 찾기
            const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
            if (titleMatch) {
              console.log('[proxy] Title:', titleMatch[1])
            }

            const h1Match = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
            if (h1Match) {
              console.log('[proxy] H1:', h1Match[1])
            }

            if (contentType.includes('text/html')) {
              // 상대 경로 리소스가 원본에서 로드되도록 <base> 태그 주입
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

            // Content-Type 헤더에 명확하게 charset=utf-8 설정
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(body)
          } catch (err) {
            res.statusCode = 500
            res.end('Proxy error: ' + String(err))
          }
        })
      },
    },
  ],
  server: {
    port: 5173,
    open: true,
  },
})
