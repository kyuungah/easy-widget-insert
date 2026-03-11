interface HoverInfo {
    x: number;
    y: number;
    path: string;
}
interface IframeViewerProps {
    src: string;
    onHover: (info: HoverInfo | null) => void;
    isTooltipHoveredRef?: React.MutableRefObject<boolean>;
}
export interface IframeViewerHandle {
    insertBefore: () => void;
    insertAfter: () => void;
    clearHighlight: () => void;
    reload: () => void;
}
declare const IframeViewer: import("react").ForwardRefExoticComponent<IframeViewerProps & import("react").RefAttributes<IframeViewerHandle>>;
export default IframeViewer;
//# sourceMappingURL=IframeViewer.d.ts.map