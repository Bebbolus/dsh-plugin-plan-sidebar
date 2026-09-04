/**
 * Tool-detail open event contract (ADR-004 pattern): the tools tab emits when
 * a catalog row is double-clicked and the dock-level ToolModalEditor consumes
 * the event, mirroring how the explorer emits open-file events for
 * FileModalEditor. Keeping the two sides decoupled (a simple listener set)
 * lets the tab render without owning any modal.
 */
/** Simple listener set; emitting with no listeners is a no-op. */
export class ToolDetailEmitter {
    listeners = new Set();
    onOpenDetail(listener) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
    /** @internal — the tools tab emits; subscribers only read. */
    emit(event) {
        for (const listener of Array.from(this.listeners))
            listener(event);
    }
}
//# sourceMappingURL=events.js.map