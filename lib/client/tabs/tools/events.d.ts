/**
 * Tool-detail open event contract (ADR-004 pattern): the tools tab emits when
 * a catalog row is double-clicked and the dock-level ToolModalEditor consumes
 * the event, mirroring how the explorer emits open-file events for
 * FileModalEditor. Keeping the two sides decoupled (a simple listener set)
 * lets the tab render without owning any modal.
 */
import type { ToolEntry } from '../../../contract/tools.ts';
export interface ToolDetailOpenEvent {
    /** The tool whose card the modal renders (all fields already loaded). */
    readonly tool: ToolEntry;
}
/** Subscribe face; also the type the dock wires into the tools tab factory. */
export interface ToolDetailEvents {
    /** @returns disposer. */
    onOpenDetail(listener: (e: ToolDetailOpenEvent) => void): () => void;
}
/** Simple listener set; emitting with no listeners is a no-op. */
export declare class ToolDetailEmitter implements ToolDetailEvents {
    private readonly listeners;
    onOpenDetail(listener: (e: ToolDetailOpenEvent) => void): () => void;
    /** @internal — the tools tab emits; subscribers only read. */
    emit(event: ToolDetailOpenEvent): void;
}
//# sourceMappingURL=events.d.ts.map