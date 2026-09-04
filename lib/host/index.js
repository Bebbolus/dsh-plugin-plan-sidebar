import { Config, resolveConfig } from "./config.js";
import { fsNode } from "./fs-node.js";
import { ExplorerService } from "./explorer.js";
import { GitRunner } from "./git-runner.js";
import { GitService } from "./git.js";
import { SkillService } from "./skills.js";
import { ToolService } from "./tools.js";
import { createChannelHandler } from "./rpc.js";
import { BETTER_SIDEBAR_NAMESPACE, registerBetterSidebarSettings, } from "./settings.js";
import { SETTINGS_DEFAULTS } from "../contract/index.js";
export { Config };
export const name = 'dsh-plugin-plan-sidebar';
export const inject = ['connection', 'tools'];
const CHANNEL = '/better-sidebar';
/**
 * Plugin entry. Loader applies schema defaults to Config; direct embeds and
 * tests may pass a partial config and resolveConfig fills it in.
 */
export function apply(ctx, config) {
    const cfg = resolveConfig(config);
    for (const root of cfg.allowedRoots) {
        if (!fsNode.isAbsolute(root)) {
            throw new Error('better-sidebar: allowedRoots entries must be absolute paths');
        }
    }
    registerBetterSidebarSettings(ctx);
    const explorer = new ExplorerService(fsNode, {
        maxEntries: cfg.maxEntriesPerListing,
        hidePatterns: cfg.hidePatterns,
        allowedRoots: cfg.allowedRoots,
        maxReadBytes: cfg.maxReadBytes,
    });
    // The git timeout is user-editable via the settings namespace when the
    // settings seam is composed (Settings > Plugins), read live on every command;
    // otherwise it falls back to the cordis config value (defaults to the
    // contract default). This replaces the previous always-fixed cordis config.
    const runner = new GitRunner({
        executable: cfg.gitExecutable,
        timeoutMs: () => readGitTimeout(ctx, cfg.gitTimeoutMs),
    });
    const git = new GitService(runner, {
        maxLogEntries: cfg.maxLogEntries,
        maxStatusEntries: cfg.maxStatusEntries,
        untrackedFiles: cfg.untrackedFiles,
    });
    const skills = new SkillService({
        getSkills: () => ctx.get('skills'),
        getAgents: () => ctx.get('agents'),
        getSession: (sessionId) => ctx.get('sessions')?.get(sessionId),
        getAgentPresets: () => ctx.get('agentPresets'),
        readDir: (dir) => fsNode.readdir(dir, { withFileTypes: true }),
    });
    const tools = new ToolService({
        getTools: () => ctx.get('tools'),
        getAgents: () => ctx.get('agents'),
        getSession: (sessionId) => ctx.get('sessions')?.get(sessionId),
        getAgentPresets: () => ctx.get('agentPresets'),
    });
    const handler = createChannelHandler({ explorer, git, skills, tools });
    ctx.inject(['connection'], (connectionCtx) => {
        connectionCtx.effect(() => {
            const dispose = connectionCtx.connection.rpc.handle(CHANNEL, handler, { authority: 'loopback' });
            return () => { void dispose(); };
        }, 'better-sidebar: rpc channel');
    });

    ctx.inject(['tools'], (toolsCtx) => {
        toolsCtx.tools.register({
            name: 'plan_sidebar_update',
            description: 'Updates the universal plan state displayed in the Plan Sidebar.',
            parameters: {
                plan_id: { type: 'string', required: true, description: 'Unique plan identifier (e.g. PLAN-01)' },
                title: { type: 'string', required: true, description: 'Descriptive title of the plan' },
                description: { type: 'string', required: false, description: "Summary of the plan's objective" },
                status: { type: 'string', required: false, description: 'Global status: IN_PROGRESS, COMPLETED, PAUSED, BLOCKED' },
                session_id: { type: 'string', required: false, description: 'Optional session identifier for per-session plan isolation' },
                tasks: {
                    type: 'array',
                    required: true,
                    description: 'Array of tasks [{ id, title, status: PENDING|RUNNING|COMPLETED|FAILED, assigned_role, runner, deliverable_file, error_message }]'
                }
            },
            output: { schema: { type: 'object' }, render: (v) => JSON.stringify(v, null, 2) },
            execute: async (args) => {
                const tasksDir = '/workspace/.dsh/tasks';
                const { promises: fsP } = await import('node:fs');
                const { default: pathM } = await import('node:path');
                await fsP.mkdir(tasksDir, { recursive: true });
                const enrichedTasks = await Promise.all((args.tasks || []).map(async (t) => {
                    if (t.deliverable_file && t.status === 'COMPLETED') {
                        try {
                            const full = pathM.isAbsolute(t.deliverable_file) ? t.deliverable_file : pathM.join('/workspace', t.deliverable_file);
                            const preview = await fsP.readFile(full, 'utf8');
                            return { ...t, preview_content: preview.slice(0, 1000) + (preview.length > 1000 ? '\n...[truncated]' : '') };
                        } catch {}
                    }
                    return t;
                }));
                const payload = {
                    plan_id: args.plan_id,
                    title: args.title,
                    description: args.description || '',
                    status: args.status || 'IN_PROGRESS',
                    updated_at: new Date().toISOString(),
                    tasks: enrichedTasks
                };
                if (args.session_id) {
                    const plansDir = pathM.join(tasksDir, 'plans');
                    await fsP.mkdir(plansDir, { recursive: true });
                    await fsP.writeFile(pathM.join(plansDir, `${args.session_id}.json`), JSON.stringify(payload, null, 2), 'utf8');
                }
                const planFile = pathM.join(tasksDir, 'plan.json');
                await fsP.writeFile(planFile, JSON.stringify(payload, null, 2), 'utf8');
                return { success: true, plan_file: planFile, count: enrichedTasks.length };
            }
        });
        toolsCtx.tools.register({
            name: 'plan_sidebar_get',
            description: 'Retrieves current plan and execution progress in universal JSON format.',
            parameters: {
                session_id: { type: 'string', required: false, description: 'Optional session identifier' }
            },
            output: { schema: { type: 'object' }, render: (v) => JSON.stringify(v, null, 2) },
            execute: async (args) => {
                const tasksDir = '/workspace/.dsh/tasks';
                const { promises: fsP } = await import('node:fs');
                const { default: pathM } = await import('node:path');
                if (args?.session_id) {
                    const sessionPlanFile = pathM.join(tasksDir, 'plans', `${args.session_id}.json`);
                    try {
                        const raw = await fsP.readFile(sessionPlanFile, 'utf8');
                        return JSON.parse(raw);
                    } catch {}
                }
                const planFile = pathM.join(tasksDir, 'plan.json');
                try {
                    const raw = await fsP.readFile(planFile, 'utf8');
                    return JSON.parse(raw);
                } catch {
                    return { plan_id: null, tasks: [], status: 'NO_PLAN_ACTIVE' };
                }
            }
        });
        toolsCtx.tools.register({
            name: 'plan_sidebar_clear',
            description: 'Clears or resets the active operational plan. Useful when the user wants to cancel the plan or start fresh from scratch.',
            parameters: {
                session_id: { type: 'string', required: false, description: 'Session ID to clear. If omitted or all=true, clears global plan.' },
                all: { type: 'boolean', required: false, description: 'Set to true to clear both session and global plan files.' }
            },
            output: { schema: { type: 'object' }, render: (v) => JSON.stringify(v, null, 2) },
            execute: async (args) => {
                const tasksDir = '/workspace/.dsh/tasks';
                const { promises: fsP } = await import('node:fs');
                const { default: pathM } = await import('node:path');
                if (args?.session_id) {
                    try { await fsP.unlink(pathM.join(tasksDir, 'plans', `${args.session_id}.json`)); } catch {}
                }
                if (!args?.session_id || args?.all) {
                    try { await fsP.unlink(pathM.join(tasksDir, 'plan.json')); } catch {}
                    try { await fsP.unlink(pathM.join(tasksDir, '00_master_plan.md')); } catch {}
                }
                return { success: true, message: 'Operational plan cleared successfully. The dashboard has been reset.' };
            }
        });
    });
}
/**
 * Read the current git timeout from the settings namespace when available,
 * else fall back to the legacy config value. Falls back to the contract
 * default when the section is not yet resolved by the settings provider.
 */
function readGitTimeout(ctx, legacyMs) {
    const settings = ctx.get('settings');
    const resolved = settings?.get(BETTER_SIDEBAR_NAMESPACE);
    if (resolved?.gitTimeoutMs !== undefined)
        return resolved.gitTimeoutMs;
    return legacyMs === undefined ? SETTINGS_DEFAULTS.gitTimeoutMs : legacyMs;
}
//# sourceMappingURL=index.js.map