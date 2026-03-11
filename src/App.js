import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import Header from './components/Header';
import IframeViewer from './components/IframeViewer';
// 외부 URL이면 Express 프록시로 변환
const toProxySrc = (url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return `/api/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};
export default function App() {
    const [iframeUrl, setIframeUrl] = useState('demo.html');
    const [hoverInfo, setHoverInfo] = useState(null);
    const iframeViewerRef = useRef(null);
    const hideTimer = useRef(undefined);
    const isTooltipHoveredRef = useRef(false);
    const handleHover = (info) => {
        // 툴팁 hover 상태에서는 새로운 요소의 hover를 무시
        if (isTooltipHoveredRef.current && info !== null) {
            return;
        }
        if (info) {
            clearTimeout(hideTimer.current);
            setHoverInfo(info);
        }
        else {
            hideTimer.current = setTimeout(() => {
                iframeViewerRef.current?.clearHighlight();
                setHoverInfo(null);
            }, 150);
        }
    };
    const handleReload = () => {
        iframeViewerRef.current?.reload();
    };
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'relative',
        }, children: [_jsx(Header, { url: iframeUrl, onNavigate: setIframeUrl, onReload: handleReload }), _jsx(IframeViewer, { ref: iframeViewerRef, src: toProxySrc(iframeUrl), onHover: handleHover, isTooltipHoveredRef: isTooltipHoveredRef }), hoverInfo && (_jsxs("div", { style: {
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
                }, onMouseEnter: () => {
                    clearTimeout(hideTimer.current);
                    isTooltipHoveredRef.current = true;
                }, onMouseMove: () => clearTimeout(hideTimer.current), onMouseLeave: () => {
                    isTooltipHoveredRef.current = false;
                    iframeViewerRef.current?.clearHighlight();
                    setHoverInfo(null);
                }, children: [_jsx("div", { style: { marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: hoverInfo.path }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx("button", { onClick: () => iframeViewerRef.current?.insertBefore(), style: {
                                    padding: '4px 8px',
                                    fontSize: 11,
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                }, children: "\uC774\uC804\uC5D0 \uC0BD\uC785" }), _jsx("button", { onClick: () => iframeViewerRef.current?.insertAfter(), style: {
                                    padding: '4px 8px',
                                    fontSize: 11,
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                }, children: "\uC774\uD6C4\uC5D0 \uC0BD\uC785" })] })] }))] }));
}
//# sourceMappingURL=App.js.map