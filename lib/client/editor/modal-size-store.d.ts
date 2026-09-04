/**
 * Shared modal-size state for the dock's resizeable editors.
 *
 * The dock mounts FileModalEditor and ToolModalEditor permanently inside
 * DockContext.Provider, so per-hook state would leave each editor with its own
 * stale copy of the dragged size (an editor only read localStorage at its own
 * first mount). This module is the single source of truth instead: a
 * framework-free external store (React store pattern, consumed through
 * useSyncExternalStore) that every editor's useModalResize hook subscribes to.
 * A drag in one editor calls setSize, which wakes every subscribed hook, so
 * every open dialog renders the same width/height and editors opened later
 * pick up the last dragged size.
 *
 * Persistence mirrors the previous per-hook behavior exactly: readSavedModalSize
 * restores the last user-resized size from localStorage, persistModalSize saves
 * it live while dragging, and the width stays authoritative through the
 * viewFileWidth plugin setting when a settings seam exists (see
 * use-modal-resize.ts).
 */
/**
 * User-resizable modal size in px; `null` means the CSS default (auto /
 * max-*). The dialog width is authoritative through the plugin setting
 * (viewFileWidth): drag-resizing the dialog writes the new width back into the
 * setting, so the setting stays the source of truth across mounts and the
 * persisted localStorage WIDTH is only a fallback for deployments without a
 * settings seam. The height keeps the per-session restore: a persisted height
 * is applied whenever set. Stored under a stable localStorage key so the
 * chosen dimensions survive reloads. Best effort: quota/denied keeps it
 * in-memory only.
 */
export interface ModalSize {
    width: number | null;
    height: number | null;
}
/** Default user-resizable size: unset so CSS max-width/max-height apply. */
export declare const DEFAULT_MODAL_SIZE: ModalSize;
/** localStorage key holding the last user-resized modal size. */
export declare const MODAL_SIZE_KEY = "dsh.betterSidebar.fileModalSize";
/** Backdrop padding (px) used to clamp the resized modal inside the viewport. */
export declare const MODAL_PADDING = 16;
/** Read a persisted modal size; anything malformed/absent falls back to default. */
export declare function readSavedModalSize(): ModalSize;
/** Persist a modal size (best effort; quota/denied keeps in-memory only). */
export declare function persistModalSize(size: ModalSize): void;
/**
 * Clamp a candidate px size into the viewport (accounting for the backdrop
 * padding so a dragged edge can never push the modal off-screen).
 */
export declare function clampToViewport(value: number, isHeight: boolean): number;
/**
 * Framework-free external store holding the dock modals' current drag size.
 *
 * Every useModalResize hook subscribes through useSyncExternalStore, so a
 * setSize from any editor re-renders all of them. The snapshot is frozen and
 * referentially stable between writes; hydrate() seeds it once from
 * localStorage with seam awareness (with a settings seam the viewFileWidth
 * setting is authoritative for width, so a saved no-seam drag width is
 * ignored; the persisted height restores either way).
 */
export declare class ModalSizeStore {
    private current;
    private readonly listeners;
    private hydrated;
    /** The current shared size (frozen; referentially stable until a write). */
    getSnapshot: () => ModalSize;
    /**
     * Subscribe to size changes (React store pattern). @returns the disposer.
     */
    subscribe: (fn: () => void) => (() => void);
    /**
     * Publish a new shared size to every subscribed editor (freezes a copy so
     * callers can keep mutating their own object safely).
     */
    setSize: (size: ModalSize) => void;
    /**
     * Seed the store from localStorage exactly once. Both dock editors call this
     * on mount with the same seam flag, so whichever effect runs first wins and
     * the second no-ops — matching the old per-hook mount-time seeding.
     */
    hydrate: (seamPresent: boolean) => void;
    /**
     * Test hook: forget the one-time hydrate and restore the unset default.
     * The store is a module singleton across tests in a file, so specs that
     * depend on its state reset it before each render.
     */
    reset: () => void;
}
/** The dock-wide singleton every editor hook subscribes to. */
export declare const modalSizeStore: ModalSizeStore;
//# sourceMappingURL=modal-size-store.d.ts.map