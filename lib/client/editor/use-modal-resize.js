/**
 * Shared drag-resize machinery for the dock's modals.
 *
 * Both FileModalEditor (the file "View file" dialog) and ToolModalEditor (the
 * tool detail dialog) resize the same way: a right-edge handle changes width, a
 * bottom-right corner handle changes width + height, dragging updates the
 * dialog live, and releasing persists the result. The two modals already share
 * the shell CSS (FileModalEditor.module.css) including the resize handle
 * classes, so the only duplicated part is the drag logic itself — extracted
 * here so the behavior cannot drift between editors.
 */
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { SETTING_RANGES } from "../../contract/settings.js";
import { useDock } from "../dock/context.js";
import { useBetterSidebarSettings } from "../tabs/shared/settings.js";
import { clampToViewport, modalSizeStore, persistModalSize } from "./modal-size-store.js";
// The size model and persistence helpers moved into the shared store module
// (modal-size-store.ts); older import sites (including the editor specs) keep
// importing them from this hook module, so they are re-exported unchanged.
export { DEFAULT_MODAL_SIZE, MODAL_SIZE_KEY, MODAL_PADDING, clampToViewport, persistModalSize, readSavedModalSize, } from "./modal-size-store.js";
/**
 * Drag-resize state and handlers for a dock modal dialog.
 *
 * The dialog width is authoritative through the plugin setting: the hook reads
 * `viewFileWidth` as the default, and a drag writes the resized width back into
 * the setting on release (clamped to SETTING_RANGES.viewFileWidth, the range
 * the host schema accepts). The localStorage width is only a no-seam fallback;
 * the height persists per-session via localStorage and restores whenever set.
 *
 * The dragged size itself lives in the shared `modalSizeStore` (see
 * modal-size-store.ts), NOT in per-hook state: every dock editor subscribes to
 * the same store, so a live drag in one dialog re-renders all of them with the
 * same width/height and editors opened later inherit the last dragged size.
 * The seam check on mount hydrates that store exactly once.
 *
 * @returns the dialog inline style (`--bsd-modal-w` / `--bsd-modal-h` custom
 * properties) with a fresh drag width applied, and the pointer handler that
 * starts a resize drag from a handle.
 */
export function useModalResize() {
    // The configured default dialog width comes from the plugin settings
    // (Settings > Plugins, `viewFileWidth`); drag-resizing the dialog writes the
    // new width back into the setting, so it stays the source of truth. Reading
    // it here reacts to live edits.
    const { settings } = useDock();
    const { viewFileWidth } = useBetterSidebarSettings(settings);
    // User-resized modal size, from the shared store so EVERY dock editor stays
    // in sync: a drag (or a viewFileWidth setting edit) re-renders every
    // subscribed hook with the same snapshot.
    const size = useSyncExternalStore(modalSizeStore.subscribe, modalSizeStore.getSnapshot);
    // Hydrate the shared store once with seam awareness: with a settings seam the
    // viewFileWidth setting is authoritative for width (a saved drag width from
    // an earlier no-seam session is ignored), and the persisted HEIGHT restores
    // either way. Both editors mount at the dock root, so whichever effect runs
    // first seeds the store; hydrate() no-ops afterwards.
    useEffect(() => {
        modalSizeStore.hydrate(settings !== undefined);
    }, [settings]);
    // Right-edge and corner drag resize. A handle captures pointerdown, then a
    // window-level pointermove updates width/height (clamped to the viewport)
    // and pointerup stops the drag, persists, and writes any width change back
    // into the viewFileWidth plugin setting (localStorage remains the no-seam
    // fallback). Pointer events are used (not just mouse) for robustness, and the
    // capture set prevents the drag selecting text.
    const dragRef = useRef(null);
    // The last dragged size, kept so the release handler can write a width
    // change back into the plugin setting once the drag settles.
    const finalSizeRef = useRef({ width: null, height: null });
    useEffect(() => {
        const onMove = (e) => {
            const drag = dragRef.current;
            if (drag === null)
                return;
            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;
            e.preventDefault();
            // Compute the next size from the shared store's CURRENT snapshot (not
            // per-hook state), so an editor never clobbers a size another editor's
            // drag just published.
            const prev = modalSizeStore.getSnapshot();
            const next = {
                width: drag.axis === 'width' || drag.axis === 'both'
                    ? clampToViewport(drag.startWidth + dx, false)
                    : prev.width,
                height: drag.axis === 'both'
                    ? clampToViewport(drag.startHeight + dy, true)
                    : prev.height,
            };
            // Track the final dragged size so the release handler can persist the
            // width as the viewFileWidth setting.
            finalSizeRef.current = next;
            // Live-persist while dragging so an interrupted release still saves.
            persistModalSize(next);
            // Publish to EVERY dock editor: the shared store wakes each subscribed
            // hook, so all open dialogs render the same size immediately.
            modalSizeStore.setSize(next);
        };
        const onUp = (e) => {
            if (dragRef.current === null)
                return;
            dragRef.current = null;
            e.preventDefault();
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            // A drag that resized the width writes the new value back into the
            // viewFileWidth plugin setting (clamped to the host-accepted range), so
            // the setting stays the source of truth and the reactive hook picks it
            // up. Without a settings seam the live persistModalSize call already
            // stored the width in localStorage.
            const width = finalSizeRef.current.width;
            if (width !== null && settings !== undefined) {
                const range = SETTING_RANGES.viewFileWidth;
                void settings.set('viewFileWidth', Math.min(range.max, Math.max(range.min, Math.round(width))));
                // The setting is authoritative for width once written: clear the
                // store's dragged width (keeping the dragged height) so a later
                // setting edit is not masked by a stale dragged value.
                modalSizeStore.setSize({ width: null, height: modalSizeStore.getSnapshot().height });
            }
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [settings]);
    /** Start a resize drag from the given handle axis and the current modal box. */
    const onResizeStart = (e, axis) => {
        e.preventDefault();
        e.stopPropagation();
        const dialog = e.currentTarget.parentElement;
        const rect = dialog.getBoundingClientRect();
        dragRef.current = {
            axis,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: Math.round(rect.width),
            startHeight: Math.round(rect.height),
        };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = axis === 'both' ? 'nwse-resize' : 'ew-resize';
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    // Apply a user-resized width/height as CSS custom properties so they override
    // the dialog's CSS default without a max-width/max-height cascade conflict.
    // The values were clamped to the viewport during the drag.
    const modalStyle = {};
    // A fresh drag-resized width wins (and was already written into the
    // viewFileWidth setting on release); otherwise the configured viewFileWidth
    // default applies only when it differs from the CSS default (560), so the
    // common case keeps the pure CSS rule (clamped by max-width).
    const widthPx = size.width !== null ? size.width : (viewFileWidth === 560 ? null : viewFileWidth);
    if (widthPx !== null)
        modalStyle['--bsd-modal-w'] = widthPx + 'px';
    if (size.height !== null)
        modalStyle['--bsd-modal-h'] = size.height + 'px';
    return { modalStyle, onResizeStart };
}
//# sourceMappingURL=use-modal-resize.js.map