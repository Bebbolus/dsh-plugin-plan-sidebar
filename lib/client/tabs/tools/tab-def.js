/**
 * Tools tab definition (ADR-003): registers the built-in tools tab with id
 * 'tools' and order 40. The factory binds the tools namespace translate once
 * so the label is locale-aware and the panel receives the same bound function.
 * The panel also receives the shared tool-detail emitter so a row
 * double-click can open the dock-level ToolModalEditor. This file stays a .ts
 * module (tab-def source is non-JSX; panel elements are built with
 * createElement to keep the compiler happy without a .tsx file).
 */
import { createElement } from 'react';
import { ToolsIcon } from "../../icons.js";
import { ToolsTab } from "./ToolsTab.js";
import { NS } from "./locales.js";
export function createToolsTabDef(ctx, api) {
    const t = ctx.locale.bind(NS);
    return {
        id: 'tools',
        order: 40,
        label: () => t('tabLabel'),
        icon: createElement(ToolsIcon),
        renderPanel: () => createElement(ToolsTab, { rpc: api.rpc, emitter: api.emitter, t }),
    };
}
//# sourceMappingURL=tab-def.js.map