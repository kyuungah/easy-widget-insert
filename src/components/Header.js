import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function Header({ url, onNavigate, onReload }) {
    const [inputValue, setInputValue] = useState(url);
    const handleSubmit = () => {
        if (inputValue.trim()) {
            onNavigate(inputValue.trim());
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };
    return (_jsxs("header", { style: {
            height: 48,
            background: '#1e1e1e',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            fontSize: 14,
            flexShrink: 0,
            gap: 12,
        }, children: [_jsx("span", { style: { color: '#888', whiteSpace: 'nowrap' }, children: "URL:" }), _jsx("input", { type: "text", value: inputValue, onChange: e => setInputValue(e.target.value), onKeyDown: handleKeyDown, placeholder: "https://...", style: {
                    flex: 1,
                    padding: '6px 8px',
                    background: '#2a2a2a',
                    border: '1px solid #404040',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    outline: 'none',
                }, onFocus: (e) => (e.target.style.borderColor = '#3b82f6'), onBlur: (e) => (e.target.style.borderColor = '#404040') }), _jsx("button", { onClick: handleSubmit, style: {
                    padding: '6px 12px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                }, children: "\uC774\uB3D9" }), _jsx("button", { onClick: onReload, style: {
                    padding: '6px 12px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                }, children: "\uCD08\uAE30\uD654" })] }));
}
//# sourceMappingURL=Header.js.map