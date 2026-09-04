/**
 * Host-side tool catalog service (ADR-001/002): maps the reachable harness
 * tool registry (ctx.tools) onto the plugin's own wire model for the
 * tools/list endpoint. The registry is resolved like skills (the per-agent
 * scoped registry when a sessionId is present, else the host-global one) and
 * merged through the harness scopes. As well as name + description, each entry
 * now carries a category tag (builtin / mcp / agent), the MCP server label for
 * mcp__* tools, and the tool's JSON-Schema parameters when the registry has
 * them — all derived from the registry name/schema, with no new RPC surface.
 * Agent tools are recognized by name prefix (subagent / team_), a small set of
 * well-known renamed-subagent names, or the harness's standard subagent-tool
 * description wording — so deployments that rename the subagent tool under a
 * custom toolName still get tagged as agents.
 */
import type { ScopeKey } from '@deepseek-ai/dsh-scope';
import type { ToolListRequest, ToolListResult, ToolCategory } from '../contract/index.ts';
/** A structural registry whose schemas carry optional JSON-Schema parameters. */
interface ToolRuntimeLike {
    schemas(scope?: ScopeKey): {
        name: string;
        description: string;
        parameters?: Record<string, unknown> | undefined;
    }[];
    get?(name: string, scope?: ScopeKey): unknown;
}
interface AgentPresetsSeam {
    serviceFor(agent: unknown, name: string): unknown;
    standingKeyFor(id?: string): Promise<unknown> | unknown;
}
export interface ToolServiceDeps {
    getTools: () => ToolRuntimeLike | undefined;
    getAgents: () => {
        get(id: string): unknown;
    } | undefined;
    getSession: (sessionId: string) => unknown;
    getAgentPresets: () => AgentPresetsSeam | undefined;
}
/**
 * Classify a tool by its harness name convention and, for unrecognized names,
 * by the harness's subagent-tool description wording. In order: `mcp__`
 * prefixed tools are MCP tools; `subagent` / `team_` prefixed names are agent
 * tools; the well-known renamed-subagent names (`code_generator`,
 * `code_explorer`) are agent tools; and any name whose description matches
 * /delegate.*subagent/i — covering the harness's two standard subagent-tool
 * wordings — is an agent tool. Plain names (bash, read, write, ...) are
 * builtin.
 */
export declare function categorizeToolName(name: string, description?: string | undefined): ToolCategory;
export declare class ToolService {
    private readonly deps;
    constructor(deps: ToolServiceDeps);
    list(req: ToolListRequest): Promise<ToolListResult>;
    private resolveRegistry;
    private resolveSessionPreset;
    private resolveScope;
    private warn;
}
export {};
//# sourceMappingURL=tools.d.ts.map