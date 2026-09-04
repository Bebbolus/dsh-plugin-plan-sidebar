/** Default user-resizable size: unset so CSS max-width/max-height apply. */
export const DEFAULT_MODAL_SIZE = { width: null, height: null };
/** localStorage key holding the last user-resized modal size. */
export const MODAL_SIZE_KEY = 'dsh.betterSidebar.fileModalSize';
/** Backdrop padding (px) used to clamp the resized modal inside the viewport. */
export const MODAL_PADDING = 16;
/** Read a persisted modal size; anything malformed/absent falls back to default. */
export function readSavedModalSize() {
    if (typeof localStorage === 'undefined')
        return DEFAULT_MODAL_SIZE;
    try {
        const raw = localStorage.getItem(MODAL_SIZE_KEY);
        if (raw === null)
            return DEFAULT_MODAL_SIZE;
        const parsed = JSON.parse(raw);
        const width = typeof parsed.width === 'number' && Number.isFinite(parsed.width) ? parsed.width : null;
        const height = typeof parsed.height === 'number' && Number.isFinite(parsed.height) ? parsed.height : null;
        return { width, height };
    }
    catch {
        return DEFAULT_MODAL_SIZE;
    }
}
/** Persist a modal size (best effort; quota/denied keeps in-memory only). */
export function persistModalSize(size) {
    if (typeof localStorage === 'undefined')
        return;
    try {
        localStorage.setItem(MODAL_SIZE_KEY, JSON.stringify(size));
    }
    catch {
        // quota/denied: keep in-memory only
    }
}
/**
 * Clamp a candidate px size into the viewport (accounting for the backdrop
 * padding so a dragged edge can never push the modal off-screen).
 */
export function clampToViewport(value, isHeight) {
    const limit = (isHeight ? window.innerHeight : window.innerWidth) - MODAL_PADDING * 2;
    return Math.max(160, Math.min(value, limit));
}
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
export class ModalSizeStore {
    // Starts as the unset default: no editor has rendered (and hydrated) yet.
    current = Object.freeze({ width: null, height: null });
    listeners = new Set();
    hydrated = false;
    /** The current shared size (frozen; referentially stable until a write). */
    getSnapshot = () => this.current;
    /**
     * Subscribe to size changes (React store pattern). @returns the disposer.
     */
    subscribe = (fn) => {
        this.listeners.add(fn);
        return () => { this.listeners.delete(fn); };
    };
    /**
     * Publish a new shared size to every subscribed editor (freezes a copy so
     * callers can keep mutating their own object safely).
     */
    setSize = (size) => {
        this.current = Object.freeze({ ...size });
        for (const listener of Array.from(this.listeners))
            listener();
    };
    /**
     * Seed the store from localStorage exactly once. Both dock editors call this
     * on mount with the same seam flag, so whichever effect runs first wins and
     * the second no-ops — matching the old per-hook mount-time seeding.
     */
    hydrate = (seamPresent) => {
        if (this.hydrated)
            return;
        this.hydrated = true;
        const saved = readSavedModalSize();
        this.current = Object.freeze({ width: seamPresent ? null : saved.width, height: saved.height });
    };
    /**
     * Test hook: forget the one-time hydrate and restore the unset default.
     * The store is a module singleton across tests in a file, so specs that
     * depend on its state reset it before each render.
     */
    reset = () => {
        this.hydrated = false;
        this.current = Object.freeze({ width: null, height: null });
        for (const listener of Array.from(this.listeners))
            listener();
    };
}
/** The dock-wide singleton every editor hook subscribes to. */
export const modalSizeStore = new ModalSizeStore();
//# sourceMappingURL=modal-size-store.js.map