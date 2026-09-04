import { type ToolCategory, type ToolEntry } from '../../../contract/tools.ts';
import type { BetterSidebarRpc } from '../../rpc-client.ts';
import type { ToolsKey } from './locales.ts';
import type { ToolDetailEmitter } from './events.ts';
/**
 * Normalize a tool's category so the tag/filter logic never sees an unknown
 * value: the host already guarantees a valid category, but a stale or foreign
 * host response must not blank the tag or drop the row from filters.
 */
export declare function effectiveCategory(tool: ToolEntry): ToolCategory;
export interface ToolsTabProps {
    rpc: BetterSidebarRpc;
    /** Shared tool-detail event source; double-click emits into it (dock dialog). */
    emitter: ToolDetailEmitter;
    /** Bound tools-namespace translate. */
    t: (key: ToolsKey, params?: Record<string, unknown>) => string;
}
export declare function ToolsTab({ rpc, emitter, t }: ToolsTabProps): import("react").JSX.Element;
//# sourceMappingURL=ToolsTab.d.ts.map