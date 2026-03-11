import { useState } from 'react'

interface HeaderProps {
  url: string
  onNavigate: (url: string) => void
  onReload: () => void
}

export default function Header({ url, onNavigate, onReload }: HeaderProps) {
  const [inputValue, setInputValue] = useState(url)

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

  return (
    <header
      style={{
        height: 48,
        background: '#1e1e1e',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        fontSize: 14,
        flexShrink: 0,
        gap: 12,
      }}
    >
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
        초기화
      </button>
    </header>
  )
}
