import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ToolModalEditor (ADR-004 pattern): the dock-level dialog that opens when a
 * tools-tab row is double-clicked. It mirrors FileModalEditor exactly —
 * mounted inside DockContext.Provider but OUTSIDE the tab panels in DockRoot,
 * so it overlays the entire dock regardless of which tab is active and stays
 * subscribed even when the dock is collapsed. The shell chrome (backdrop /
 * dialog / header / title / close / body) is FileModalEditor's CSS; only the
 * tool-card content classes are local. Drag-resize works through the shared
 * useModalResize hook (mirrors FileModalEditor): a right-edge handle resizes
 * width, the bottom-right corner handle resizes width + height, and the
 * dragged width is written back into the viewFileWidth setting (height
 * persists per-session in localStorage).
 */
import { useEffect, useState } from 'react';
import { TOOL_CATEGORIES } from "../../contract/tools.js";
import { CATEGORY_CLASS, CATEGORY_KEY } from "../tabs/tools/category.js";
import { CloseIcon } from "../icons.js";
import { useModalResize } from "./use-modal-resize.js";
import editorCss from './FileModalEditor.module.css';
import tagCss from '../tabs/tools/tools.module.css';
import styles from './ToolModalEditor.module.css';
export function ToolModalEditor({ events, t }) {
    const [tool, setTool] = useState(null);
    // Subscribes once: a detail-open event carries every field the card needs,
    // so opening is a pure state handoff (no RPC).
    useEffect(() => events.onOpenDetail(e => setTool(e.tool)), [events]);
    // Drag-resize (right-edge width handle + bottom-right corner handle) with
    // the dragged width written back into the viewFileWidth setting on release;
    // the shared hook owns the modal size state, persistence, and drag handlers.
    const { modalStyle, onResizeStart } = useModalResize();
    // Escape closes the modal; the listener is armed only while one is open.
    useEffect(() => {
        if (tool === null)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                setTool(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [tool]);
    if (tool === null)
        return null;
    // The host already normalizes categories, but a stale/foreign response must
    // never blank the tag: anything unknown renders as builtin (mirrors the
    // ToolsTab row logic).
    const category = TOOL_CATEGORIES.includes(tool.category) ? tool.category : 'builtin';
    const categoryLabel = t(CATEGORY_KEY[category] ?? 'categoryBuiltin');
    const categoryClass = CATEGORY_CLASS[category];
    return (_jsx("div", { className: editorCss.backdrop, onClick: () => setTool(null), role: "presentation", children: _jsxs("div", { className: editorCss.dialog, role: "dialog", "aria-modal": "true", "aria-label": tool.name, style: modalStyle, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: editorCss.header, children: [_jsx("span", { className: editorCss.title, title: tool.name, children: tool.name }), _jsx("button", { type: "button", className: editorCss.closeButton, "aria-label": t('detailClose'), title: t('detailClose'), onClick: () => setTool(null), children: _jsx(CloseIcon, { size: 16 }) })] }), _jsx("div", { className: editorCss.body, children: _jsxs("div", { className: styles.content, children: [_jsx("div", { className: styles.desc, children: tool.description }), _jsxs("div", { className: styles.meta, children: [_jsx("span", { className: `${tagCss.tag} ${categoryClass}`, "aria-label": categoryLabel, children: categoryLabel }), tool.server !== undefined && _jsx("span", { className: styles.server, children: tool.server })] }), _jsx("div", { className: styles.sectionTitle, children: t('detailSchemaTitle') }), tool.parameters === undefined
                                ? _jsx("div", { className: styles.noParameters, children: t('noParameters') })
                                : _jsx("pre", { className: styles.schema, children: JSON.stringify(tool.parameters, null, 2) })] }) }), _jsx("div", { className: editorCss.resizeHandle, role: "separator", "aria-orientation": "vertical", "aria-label": t('detailResize'), onPointerDown: (e) => onResizeStart(e, 'width') }), _jsx("div", { className: editorCss.resizeCorner, role: "separator", "aria-label": t('detailResizeCorner'), onPointerDown: (e) => onResizeStart(e, 'both') })] }) }));
}
//# sourceMappingURL=ToolModalEditor.js.map