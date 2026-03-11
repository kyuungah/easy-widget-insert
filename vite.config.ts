import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
            let body = await response.text()

            if (contentType.includes('text/html')) {
              // 상대 경로 리소스가 원본에서 로드되도록 <base> 태그 주입
              const origin = new URL(response.url).origin
              body = body.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`)
            }

            // X-Frame-Options, CSP 등 iframe 차단 헤더 제거 후 동일 origin으로 응답
            res.setHeader('Content-Type', contentType)
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
