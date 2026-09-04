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
import { type CSSProperties } from 'react';
export { DEFAULT_MODAL_SIZE, MODAL_SIZE_KEY, MODAL_PADDING, ModalSize, clampToViewport, persistModalSize, readSavedModalSize, } from './modal-size-store.ts';
/** Dialog inline style: the dialog's own CSS props plus the resize custom properties. */
export interface ModalResizeStyle extends CSSProperties {
    '--bsd-modal-w'?: string;
    '--bsd-modal-h'?: string;
}
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
export declare function useModalResize(): {
    modalStyle: ModalResizeStyle;
    onResizeStart: (e: React.PointerEvent<HTMLDivElement>, axis: 'width' | 'both') => void;
};
//# sourceMappingURL=use-modal-resize.d.ts.map