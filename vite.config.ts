import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import iconv from 'iconv-lite'

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
      configureServer(server) {
        server.middlewares.use('/api/proxy', async (req, res) => {
          try {
            const targetUrl = new URL(`http://dummy${req.url}`).searchParams.get('url')
            if (!targetUrl) {
              res.statusCode = 400
              res.end('Missing url parameter')
              return
            }

            const response = await fetch(targetUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' },
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

            // iconv-lite로 실제 charset 디코딩
            let body: string
            try {
              body = iconv.decode(Buffer.from(buffer), charset)
              console.log('[proxy] Decoded successfully with charset:', charset)
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
            } catch (error) {
              // charset 지원 안 되면 UTF-8 fallback
              console.log('[proxy] Decode error, falling back to UTF-8:', error)
              body = new TextDecoder('utf-8').decode(buffer)
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
