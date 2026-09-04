import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { BetterSidebarRpc } from '../../rpc-client.ts';
import type { TabDef } from '../../tab-registry/contract.ts';
import type { ToolDetailEmitter } from './events.ts';
export interface CreateToolsTabDefApi {
    rpc: BetterSidebarRpc;
    /** Shared tool-detail event source the panel emits into on row double-click. */
    emitter: ToolDetailEmitter;
}
export declare function createToolsTabDef(ctx: ClientContext, api: CreateToolsTabDefApi): TabDef;
//# sourceMappingURL=tab-def.d.ts.map