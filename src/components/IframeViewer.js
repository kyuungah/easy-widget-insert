import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
const HIGHLIGHT_CLASS = '__iframe-hover-highlight__';
const HIGHLIGHT_STYLE = `
  .__iframe-hover-highlight__ {
    outline: 2px solid rgba(255, 200, 0, 0.8) !important;
    background-color: rgba(255, 255, 0, 0.3) !important;
  }
`;
function createBannerElement(doc) {
    const el = doc.createElement('div');
    el.style.cssText = `
    width: 100%;
    height: 200px;
    background-color: #22c55e;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    font-weight: bold;
    font-family: sans-serif;
    box-sizing: border-box;
  `;
    el.textContent = 'banner';
    return el;
}
function getDomPath(element) {
    const parts = [];
    let current = element;
    while (current && current.tagName.toLowerCase() !== 'html') {
        const tag = current.tagName.toLowerCase();
        if (current.id) {
            parts.unshift(`#${current.id}`);
        }
        else if (current.classList.length > 0) {
            // HIGHLIGHT_CLASS는 필터링
            const classes = Array.from(current.classList).filter((c) => c !== HIGHLIGHT_CLASS);
            parts.unshift(classes.length > 0 ? `.${classes.join('.')}` : tag);
        }
        else {
            parts.unshift(tag);
        }
        current = current.parentElement;
    }
    return parts.join('>');
}
const IframeViewer = forwardRef(({ src, onHover, isTooltipHoveredRef }, ref) => {
    const iframeRef = useRef(null);
    // 이전에 하이라이트된 요소를 추적
    const prevHighlightedRef = useRef(null);
    // 현재 호버된 요소를 추적 (삽입을 위해)
    const currentHoveredRef = useRef(null);
    const handleLoad = () => {
        const iframe = iframeRef.current;
        if (!iframe)
            return;
        const doc = iframe.contentDocument;
        if (!doc)
            return;
        // 1. 하이라이트용 스타일 주입
        const styleTag = doc.createElement('style');
        styleTag.textContent = HIGHLIGHT_STYLE;
        doc.head.appendChild(styleTag);
        // 2. mouseover 이벤트 등록
        const handleMouseOver = (e) => {
            const target = e.target;
            // body, html 등 의미없는 최상위 요소는 무시
            if (target === doc.body || target === doc.documentElement) {
                return;
            }
            // 툴팁 hover 중이면 하이라이트 변경 안 함
            if (isTooltipHoveredRef?.current) {
                return;
            }
            // 이전 하이라이트 제거
            if (prevHighlightedRef.current && prevHighlightedRef.current !== target) {
                prevHighlightedRef.current.classList.remove(HIGHLIGHT_CLASS);
            }
            // 새 하이라이트 적용
            target.classList.add(HIGHLIGHT_CLASS);
            prevHighlightedRef.current = target;
            currentHoveredRef.current = target; // 현재 호버된 요소 추적
            // 좌표 계산: iframe viewport 기준 좌표 → 부모 viewport 기준 좌표
            const iframeRect = iframe.getBoundingClientRect();
            const absoluteX = iframeRect.left + e.clientX; // 마우스 X 좌표
            const absoluteY = iframeRect.top + e.clientY; // 마우스 Y 좌표
            onHover({
                x: absoluteX,
                y: absoluteY,
                path: getDomPath(target),
            });
        };
        const handleMouseLeave = () => {
            onHover(null);
            // 하이라이트 제거는 App에서 clearHighlight() 호출 시 처리
        };
        doc.addEventListener('mouseover', handleMouseOver);
        doc.addEventListener('mouseleave', handleMouseLeave);
        // cleanup 반환
        return () => {
            doc.removeEventListener('mouseover', handleMouseOver);
            doc.removeEventListener('mouseleave', handleMouseLeave);
        };
    };
    // cleanup ref로 관리
    const cleanupRef = useRef(undefined);
    const onLoadHandler = () => {
        // 이전 리스너 cleanup 후 새 리스너 등록
        cleanupRef.current?.();
        cleanupRef.current = handleLoad() ?? undefined;
    };
    // 컴포넌트 언마운트 시 최종 cleanup
    useEffect(() => {
        return () => {
            cleanupRef.current?.();
        };
    }, []);
    // 삽입 메서드 노출
    useImperativeHandle(ref, () => ({
        insertBefore: () => {
            const el = currentHoveredRef.current;
            if (!el || !iframeRef.current?.contentDocument)
                return;
            const banner = createBannerElement(iframeRef.current.contentDocument);
            el.parentElement?.insertBefore(banner, el);
        },
        insertAfter: () => {
            const el = currentHoveredRef.current;
            if (!el || !iframeRef.current?.contentDocument)
                return;
            const banner = createBannerElement(iframeRef.current.contentDocument);
            el.insertAdjacentElement('afterend', banner);
        },
        clearHighlight: () => {
            if (prevHighlightedRef.current) {
                prevHighlightedRef.current.classList.remove(HIGHLIGHT_CLASS);
                prevHighlightedRef.current = null;
            }
            currentHoveredRef.current = null;
        },
        reload: () => {
            iframeRef.current?.contentWindow?.location.reload();
        },
    }));
    return (_jsx("iframe", { ref: iframeRef, src: src, onLoad: onLoadHandler, style: {
            flex: 1,
            border: 'none',
            display: 'block',
            width: '100%',
        }, title: "Demo iframe" }));
});
IframeViewer.displayName = 'IframeViewer';
export default IframeViewer;
//# sourceMappingURL=IframeViewer.js.map