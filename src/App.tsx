import { useState, useRef, useEffect } from 'react'
import Header from './components/Header'
import IframeViewer, { IframeViewerHandle } from './components/IframeViewer'

interface HoverInfo {
  x: number
  y: number
  path: string
}

const toProxySrc = (url: string, mobile = false) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/proxy?url=${encodeURIComponent(url)}${mobile ? '&mobile=1' : ''}`
  }
  return url
}

export default function App() {
  const [iframeUrl, setIframeUrl] = useState('demo.html')
  const [viewMode, setViewMode] = useState<'pc' | 'mobile'>('pc')
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const iframeViewerRef = useRef<IframeViewerHandle>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isTooltipHoveredRef = useRef(false)

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'navigate' && typeof event.data.url === 'string') {
        setIframeUrl(event.data.url)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const handleHover = (info: HoverInfo | null) => {
    if (isTooltipHoveredRef.current && info !== null) return
    if (info) {
      clearTimeout(hideTimer.current)
      setHoverInfo(info)
    } else {
      hideTimer.current = setTimeout(() => {
        iframeViewerRef.current?.clearHighlight()
        setHoverInfo(null)
      }, 150)
    }
  }

  const handleReload = () => {
    iframeViewerRef.current?.reload()
  }

  const handleViewModeChange = (mode: 'pc' | 'mobile') => {
    setViewMode(mode)
    iframeViewerRef.current?.reload()
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
      }}
    >
      <Header
        url={iframeUrl}
        onNavigate={setIframeUrl}
        onReload={handleReload}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: viewMode === 'mobile' ? 'center' : 'stretch',
          background: viewMode === 'mobile' ? '#d1d5db' : 'transparent',
        }}
      >
        <div
          style={{
            width: viewMode === 'mobile' ? 480 : '100%',
            height: '100%',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <IframeViewer
            ref={iframeViewerRef}
            src={toProxySrc(iframeUrl, viewMode === 'mobile')}
            onHover={handleHover}
            isTooltipHoveredRef={isTooltipHoveredRef}
            mobile={viewMode === 'mobile'}
          />
        </div>
      </div>

      {hoverInfo && (
        <div
          style={{
            position: 'fixed',
            top: hoverInfo.y - 10,
            left: hoverInfo.x + 15,
            transform: 'none',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: 200,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '8px',
              fontSize: 12,
              fontFamily: 'monospace',
              pointerEvents: 'auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={() => {
              clearTimeout(hideTimer.current)
              isTooltipHoveredRef.current = true
            }}
            onMouseMove={() => clearTimeout(hideTimer.current)}
            onMouseLeave={() => {
              isTooltipHoveredRef.current = false
              iframeViewerRef.current?.clearHighlight()
              setHoverInfo(null)
            }}
          >
            <div style={{ marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {hoverInfo.path}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => {
                  iframeViewerRef.current?.insertBefore()
                  iframeViewerRef.current?.clearHighlight()
                  isTooltipHoveredRef.current = false
                  setHoverInfo(null)
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: 11,
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                }}
              >
                이전에 삽입
              </button>
              <button
                onClick={() => {
                  iframeViewerRef.current?.insertAfter()
                  iframeViewerRef.current?.clearHighlight()
                  isTooltipHoveredRef.current = false
                  setHoverInfo(null)
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: 11,
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                }}
              >
                이후에 삽입
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
