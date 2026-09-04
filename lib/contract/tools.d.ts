/**
 * Tools models shared by host (producer) and client (consumer).
 * Pure types; no Node/DOM/React imports.
 */
/** The taxonomy used to tag and filter the tool catalog rows. */
export declare const TOOL_CATEGORIES: readonly ["builtin", "mcp", "agent"];
/** One tool category: plain harness tools, MCP server tools, or agent tools. */
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
/** One tool's summary for the tab list. */
export interface ToolEntry {
    name: string;
    description: string;
    /** Taxonomy bucket the row tag / filter bar uses. */
    category: ToolCategory;
    /** MCP server display label; present only for MCP tools. */
    server?: string;
    /** The tool's JSON-Schema parameter object, when the registry carries it. */
    parameters?: Record<string, unknown>;
}
/** The tool catalog merges the reachable harness scopes.
 *  An optional session id scopes the merge to that agent's layer chain. */
export interface ToolListRequest {
    /** Absolute workspace root (kept for consistency with skills; tools are not cwd-sensitive). */
    cwd: string;
    /** Active session id; when present the host merges its per-agent scope chain. */
    sessionId?: string;
}
export interface ToolListResult {
    tools: ToolEntry[];
    /** Human-readable failure detail when the catalog could not be listed. */
    warning?: string;
}
//# sourceMappingURL=tools.d.ts.map