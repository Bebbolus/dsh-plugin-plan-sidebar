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
export function categorizeToolName(name, description) {
    if (name.startsWith('mcp__'))
        return 'mcp';
    if (name.startsWith('subagent') || name.startsWith('team_'))
        return 'agent';
    // Harness deployments may register the subagent tool under a custom toolName;
    // these well-known deployment names are subagent tools even without a
    // description match.
    if (name === 'code_generator' || name === 'code_explorer')
        return 'agent';
    // Renamed subagent tools keep one of the standard harness descriptions
    // ("Delegate a task to a subagent that inherits this conversation: ..." or
    // "Delegate a self-contained task to a subagent (a separate agent ...)"),
    // both covered by the common "delegate ... subagent" wording.
    if (description !== undefined && /delegate.*subagent/i.test(description))
        return 'agent';
    return 'builtin';
}
/**
 * Extract the MCP server display label from an `mcp__<server>__<tool>` name:
 * the substring between the `mcp__` prefix and the LAST `__` separator (server
 * names may themselves contain `__`). Degrades to the whole remainder when
 * there is no separator; `undefined` when nothing remains.
 */
function mcpServerOf(name) {
    if (!name.startsWith('mcp__'))
        return undefined;
    const remainder = name.slice('mcp__'.length);
    const sep = remainder.lastIndexOf('__');
    const server = sep === -1 ? remainder : remainder.slice(0, sep);
    return server === '' ? undefined : server;
}
export class ToolService {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async list(req) {
        try {
            const { registry, scope } = await this.resolveRegistry(req);
            if (!registry)
                return this.warn('tool registry is absent (host does not compose @deepseek-ai/dsh-tools)');
            const schemas = registry.schemas(scope);
            const tools = schemas.map(s => {
                const server = mcpServerOf(s.name);
                // exactOptionalPropertyTypes: server/parameters are only ever present
                // when actually defined — never explicitly undefined.
                return {
                    name: s.name,
                    description: s.description,
                    category: categorizeToolName(s.name, s.description),
                    ...(server === undefined ? {} : { server }),
                    ...(s.parameters === undefined ? {} : { parameters: s.parameters }),
                };
            });
            tools.sort((a, b) => a.name.localeCompare(b.name));
            return { tools };
        }
        catch (error) {
            return this.warn(error);
        }
    }
    async resolveRegistry(req) {
        const live = req.sessionId === undefined ? undefined : this.deps.getAgents()?.get(req.sessionId);
        const presets = this.deps.getAgentPresets();
        const scoped = live === undefined ? undefined : presets?.serviceFor(live, 'tools');
        return { registry: scoped ?? this.deps.getTools(), scope: await this.resolveScope(req.sessionId, live, presets) };
    }
    resolveSessionPreset(session) {
        const events = session?.events;
        if (events !== undefined) {
            for (let index = events.length - 1; index >= 0; index -= 1) {
                const event = events[index];
                if (event?.type === 'agent-preset/selected')
                    return event.data?.agentPreset;
            }
        }
        return session?.header?.agentPreset;
    }
    async resolveScope(sessionId, live, presets) {
        if (live !== undefined)
            return live;
        if (presets === undefined)
            return undefined;
        try {
            const session = sessionId === undefined ? undefined : this.deps.getSession(sessionId);
            const presetId = this.resolveSessionPreset(session);
            const key = await presets.standingKeyFor(presetId);
            return key;
        }
        catch {
            return undefined;
        }
    }
    warn(error) {
        const detail = error instanceof Error ? error.message : String(error);
        console.error(`better-sidebar: tools/list failed, returning warning: ${detail}`);
        return { tools: [], warning: `tools/list failed: ${detail}` };
    }
}
//# sourceMappingURL=tools.js.map