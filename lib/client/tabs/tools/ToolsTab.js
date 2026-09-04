import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Tools tab panel: shows the harness tool catalog by reading the host
 * tool-registry service (ctx.tools) over the tools/list endpoint. The fetch
 * is cwd-scoped for consistency with skills and the host merges the reachable
 * harness scopes (global layer + the active agent's layer chain when a session
 * id is present). Any domain error returned by the host is logged to the
 * browser console. A listing failure (absent registry or registry error) is
 * surfaced by the host as a SUCCESS result carrying a `warning` string, which
 * the tab renders as a visible hint above the catalog rather than a hard error.
 * Each row shows the tool's name, description, and a category tag (builtin /
 * mcp / agent), and a filter bar narrows the catalog by category. Double
 * clicking a row emits a tool-detail-open event; the dock-level
 * ToolModalEditor (mounted in DockRoot) renders the detail card (category +
 * MCP server + parameters) over the whole dock — all from data already
 * present in the ToolEntry, no extra RPC.
 * Auto-loads via a silent fallback poll on an interval, in addition to a
 * manual refresh and one fetch on mount (or when the active session or
 * workspace changes).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Endpoints } from "../../../contract/rpc.js";
import { TOOL_CATEGORIES } from "../../../contract/tools.js";
import { useDock } from "../../dock/context.js";
import { resolveRoot } from "../../workspace-root.js";
import { RefreshIcon, ToolsIcon } from "../../icons.js";
import { useBetterSidebarSettings } from "../shared/settings.js";
import { CATEGORY_CLASS, CATEGORY_KEY } from "./category.js";
import styles from './tools.module.css';
/**
 * Normalize a tool's category so the tag/filter logic never sees an unknown
 * value: the host already guarantees a valid category, but a stale or foreign
 * host response must not blank the tag or drop the row from filters.
 */
export function effectiveCategory(tool) {
    return TOOL_CATEGORIES.includes(tool.category) ? tool.category : 'builtin';
}
export function ToolsTab({ rpc, emitter, t }) {
    const { useSessions, useWorkspaces, settings } = useDock();
    const sessions = useSessions(s => s);
    const workspaces = useWorkspaces(w => w);
    const root = resolveRoot(sessions, workspaces);
    const sessionId = sessions.current;
    const { skillsPollMs } = useBetterSidebarSettings(settings);
    const [state, setState] = useState({ kind: 'loading' });
    const controllerRef = useRef(null);
    // Category filter ('all' shows every row).
    const [filter, setFilter] = useState('all');
    // Categories actually present in the loaded catalog, in the canonical order.
    const presentCategories = TOOL_CATEGORIES.filter(cat => state.kind === 'loaded' && state.tools.some(tool => effectiveCategory(tool) === cat));
    // Rows matching the active category filter ('all' keeps the whole catalog).
    const filteredTools = state.kind === 'loaded'
        ? filter === 'all' ? state.tools : state.tools.filter(tool => effectiveCategory(tool) === filter)
        : [];
    const fetchCatalog = useCallback((opts) => {
        if (root === undefined) {
            if (!opts.silent)
                setState({ kind: 'noWorkspace' });
            return;
        }
        controllerRef.current?.abort();
        const ctrl = new AbortController();
        controllerRef.current = ctrl;
        if (!opts.silent)
            setState({ kind: 'loading' });
        void (async () => {
            const payload = { cwd: root, ...(sessionId === undefined ? {} : { sessionId }) };
            const res = await rpc.call(Endpoints.toolsList, payload, { signal: ctrl.signal });
            if (ctrl.signal.aborted)
                return;
            if (res.ok)
                setState({ kind: 'loaded', tools: res.value.tools, ...(res.value.warning === undefined ? {} : { warning: res.value.warning }) });
            else {
                console.error('better-sidebar: tools/list failed', JSON.stringify(res));
                setState({ kind: 'error', message: res.error?.message ?? '' });
            }
        })();
    }, [rpc, root, sessionId]);
    const refresh = useCallback(() => { void fetchCatalog({ silent: false }); }, [fetchCatalog]);
    useEffect(() => {
        refresh();
        return () => controllerRef.current?.abort();
    }, [refresh]);
    useEffect(() => {
        if (root === undefined)
            return;
        const id = window.setInterval(() => {
            if (document.hidden)
                return;
            void fetchCatalog({ silent: true });
        }, skillsPollMs);
        return () => window.clearInterval(id);
    }, [root, fetchCatalog, skillsPollMs]);
    return (_jsxs("div", { className: styles.panel, children: [_jsxs("div", { className: styles.header, children: [_jsxs("span", { className: styles.title, children: [_jsx(ToolsIcon, { size: 14 }), _jsx("span", { children: t('tabLabel') })] }), _jsx("button", { type: "button", className: styles.iconButton, "aria-label": t('refresh'), onClick: refresh, children: _jsx(RefreshIcon, { size: 14 }) })] }), state.kind === 'loaded' && state.tools.length > 0 && (_jsxs("div", { className: styles.filterBar, role: "group", "aria-label": t('filterAll'), children: [_jsx("button", { type: "button", className: filter === 'all' ? styles.filterChip + ' ' + styles.filterChipActive : styles.filterChip, "aria-pressed": filter === 'all', onClick: () => setFilter('all'), children: t('filterAll') }), presentCategories.map(cat => (_jsx("button", { type: "button", className: filter === cat ? styles.filterChip + ' ' + styles.filterChipActive : styles.filterChip, "aria-pressed": filter === cat, onClick: () => setFilter(cat), children: t(CATEGORY_KEY[cat]) }, cat)))] })), _jsxs("div", { className: styles.body, children: [state.kind === 'loading' && _jsx("div", { className: styles.loading, children: t('loading') }), state.kind === 'error' && (_jsxs("div", { className: styles.state, children: [_jsx("div", { className: styles.stateTitle, children: t('errorTitle') }), _jsx("div", { className: styles.stateHint, children: state.message }), _jsx("button", { type: "button", className: styles.stateAction, onClick: refresh, children: t('errorRetry') })] })), state.kind === 'noWorkspace' && (_jsxs("div", { className: styles.state, children: [_jsx("div", { className: styles.stateTitle, children: t('noWorkspace') }), _jsx("div", { className: styles.stateHint, children: t('noWorkspaceHint') })] })), state.kind === 'loaded' && state.warning !== undefined && (_jsxs("div", { className: styles.warning, children: [_jsx("span", { className: styles.warningTitle, children: t('warningTitle') }), _jsx("span", { className: styles.warningText, children: state.warning })] })), state.kind === 'loaded' && state.tools.length === 0 && (_jsxs("div", { className: styles.empty, children: [_jsx("div", { className: styles.stateTitle, children: t('emptyTitle') }), _jsx("div", { className: styles.stateHint, children: t('emptyHint') })] })), state.kind === 'loaded' && state.tools.length > 0 && (filteredTools.length === 0
                        ? (_jsxs("div", { className: styles.empty, children: [_jsx("div", { className: styles.stateTitle, children: t('emptyTitle') }), _jsx("div", { className: styles.stateHint, children: t('emptyHint') })] }))
                        : (_jsx("ul", { className: styles.list, children: filteredTools.map(tool => {
                                const categoryLabel = t(CATEGORY_KEY[effectiveCategory(tool)] ?? 'categoryBuiltin');
                                return (_jsxs("li", { className: styles.row, title: tool.name, onDoubleClick: () => emitter.emit({ tool }), children: [_jsx("span", { className: styles.toolName, children: tool.name }), _jsx("span", { className: styles.toolDesc, children: tool.description }), _jsx("span", { className: `${styles.tag} ${CATEGORY_CLASS[effectiveCategory(tool)]}`, "aria-label": categoryLabel, children: categoryLabel })] }, tool.name));
                            }) })))] })] }));
}
//# sourceMappingURL=ToolsTab.js.map