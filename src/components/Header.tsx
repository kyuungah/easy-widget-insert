import { useState, useEffect } from 'react'

interface HeaderProps {
  url: string
  onNavigate: (url: string) => void
  onReload: () => void
  viewMode: 'pc' | 'mobile'
  onViewModeChange: (mode: 'pc' | 'mobile') => void
}

export default function Header({ url, onNavigate, onReload, viewMode, onViewModeChange }: HeaderProps) {
  const [inputValue, setInputValue] = useState(url)

  useEffect(() => {
    setInputValue(url)
  }, [url])

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onNavigate(inputValue.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 20px',
    fontSize: 13,
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: active ? '#fff' : '#888',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
  })

  return (
    <header
      style={{
        background: '#1e1e1e',
        color: '#fff',
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      {/* 1행: URL 입력 + 버튼 */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
        }}
      >
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '6px 12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          초기 페이지로 이동 (cmd+r)
        </button>
        <span style={{ color: '#888', whiteSpace: 'nowrap' }}>URL:</span>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://..."
          style={{
            flex: 1,
            padding: '6px 8px',
            background: '#2a2a2a',
            border: '1px solid #404040',
            borderRadius: 4,
            color: '#fff',
            fontSize: 13,
            fontFamily: 'monospace',
            outline: 'none',
          }}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
            (e.target.style.borderColor = '#3b82f6')
          }
          onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
            (e.target.style.borderColor = '#404040')
          }
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '6px 12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          이동
        </button>
        <button
          onClick={onReload}
          style={{
            padding: '6px 12px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          삽입된 위젯 전부 삭제
        </button>
      </div>

      {/* 2행: PC / Mobile 탭 */}
      <div
        style={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid #2a2a2a',
          gap: 8,
        }}
      >
        <button style={tabStyle(viewMode === 'pc')} onClick={() => onViewModeChange('pc')}>
          PC
        </button>
        <button style={tabStyle(viewMode === 'mobile')} onClick={() => onViewModeChange('mobile')}>
          Mobile
        </button>
      </div>
    </header>
  )
}
