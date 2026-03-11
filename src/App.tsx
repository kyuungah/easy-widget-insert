import { useState, useRef } from 'react'
import Header from './components/Header'
import IframeViewer, { IframeViewerHandle } from './components/IframeViewer'

interface HoverInfo {
  x: number
  y: number
  path: string
}

// 외부 URL이면 프록시 경로로 변환
const toProxySrc = (url: string) =>
  url.startsWith('http://') || url.startsWith('https://')
    ? `/proxy?url=${encodeURIComponent(url)}`
    : url

export default function App() {
  const [iframeUrl, setIframeUrl] = useState('/demo.html')
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const iframeViewerRef = useRef<IframeViewerHandle>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()
  const isTooltipHoveredRef = useRef(false)

  const handleHover = (info: HoverInfo | null) => {
    // 툴팁 hover 상태에서는 새로운 요소의 hover를 무시
    if (isTooltipHoveredRef.current && info !== null) {
      return
    }

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
      }}
    >
      <Header url={iframeUrl} onNavigate={setIframeUrl} onReload={handleReload} />
      <IframeViewer
        ref={iframeViewerRef}
        src={toProxySrc(iframeUrl)}
        onHover={handleHover}
        isTooltipHoveredRef={isTooltipHoveredRef}
      />

      {/* Tooltip: 부모 React 앱 레이어에서 렌더링 */}
      {hoverInfo && (
        <div
          style={{
            position: 'fixed',
            top: hoverInfo.y,
            left: hoverInfo.x,
            transform: 'translateX(-50%)',
            width: 200,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '8px',
            fontSize: 12,
            fontFamily: 'monospace',
            pointerEvents: 'auto',
            zIndex: 9999,
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
              onClick={() => iframeViewerRef.current?.insertBefore()}
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
              onClick={() => iframeViewerRef.current?.insertAfter()}
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
      )}
    </div>
  )
}
