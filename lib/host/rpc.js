import { Endpoints, isExplorerListRequest, isExplorerReadRequest, isExplorerStampRequest, isGitCommitDetailRequest, isGitCommitFileDiffRequest, isGitCommitRequest, isGitDiscardRequest, isGitDiffRequest, isGitLogRequest, isGitStageRequest, isGitStatusRequest, isSkillListRequest, isSkillDetailRequest, isToolListRequest, } from "../contract/index.js";
import { promises as fsPromises } from 'node:fs';
import * as path from 'node:path';
/**
 * Per ADR-002: the RPC value slot ALWAYS carries the SidebarResult envelope —
 * success AND domain failure alike — because the client facade rehydrates
 * SidebarResult<T> from result.value (a raw page there would be misread as a
 * result with ok: undefined). The single exception is genuine caller
 * cancellation, which maps to the RPC error slot code 'cancelled'.
 */
function toRpcResult(sr) {
    if (!sr.ok && sr.error.code === 'cancelled') {
        return { ok: false, error: { code: 'cancelled', message: sr.error.message, details: {} } };
    }
    return { ok: true, value: sr };
}
function badRequest(message) {
    return { ok: false, error: { code: 'bad-request', message, details: { issues: [] } } };
}
/**
 * Build the channel handler that the host plugin registers via
 * rpc.handle('/better-sidebar', handler, { authority: 'loopback' }).
 */
export function createChannelHandler(services) {
    return (endpoint, payload, signal) => dispatch(services, endpoint, payload, signal);
}
async function dispatch(services, endpoint, payload, signal) {
    switch (endpoint) {
        case Endpoints.explorerList: {
            if (!isExplorerListRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            try {
                const value = await services.explorer.list(payload);
                return toRpcResult({ ok: true, value });
            }
            catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case Endpoints.explorerStamp: {
            if (!isExplorerStampRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            try {
                const value = await services.explorer.stamp(payload);
                return toRpcResult({ ok: true, value });
            }
            catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case Endpoints.explorerRead: {
            if (!isExplorerReadRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            try {
                const value = await services.explorer.read(payload);
                return toRpcResult({ ok: true, value });
            }
            catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case Endpoints.gitStatus: {
            if (!isGitStatusRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            return toRpcResult(await services.git.status(payload, signal));
        }
        case Endpoints.gitLog: {
            if (!isGitLogRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            return toRpcResult(await services.git.log(payload, signal));
        }
        case Endpoints.gitStage: {
            if (!isGitStageRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            return toRpcResult(await services.git.stage(payload, signal));
        }
        case Endpoints.gitUnstage: {
            if (!isGitStageRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            return toRpcResult(await services.git.unstage(payload, signal));
        }
        case Endpoints.gitCommitDetail: {
            if (!isGitCommitDetailRequest(payload)) {
                // Diagnostic: a trust-boundary rejection is worth knowing what arrived
                // (the browser and host can drift across builds).
                console.warn('better-sidebar: rejected git/commit-detail payload', JSON.stringify(payload));
                return badRequest('invalid payload for ' + endpoint);
            }
            return toRpcResult(await services.git.commitDetail(payload, signal));
        }
        case Endpoints.gitCommit: {
            if (!isGitCommitRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            return toRpcResult(await services.git.commit(payload, signal));
        }
        case Endpoints.gitDiscard: {
            if (!isGitDiscardRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            return toRpcResult(await services.git.discard(payload, signal));
        }
        case Endpoints.gitDiff: {
            if (!isGitDiffRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            return toRpcResult(await services.git.diff(payload, signal));
        }
        case Endpoints.gitCommitFileDiff: {
            if (!isGitCommitFileDiffRequest(payload)) {
                // Diagnostic: a trust-boundary rejection is worth knowing what arrived
                // (the browser and host can drift across builds).
                console.warn('better-sidebar: rejected git/commit-file-diff payload', JSON.stringify(payload));
                return badRequest('invalid payload for ' + endpoint);
            }
            return toRpcResult(await services.git.commitFileDiff(payload, signal));
        }
        case Endpoints.skillsList: {
            if (!isSkillListRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            try {
                const value = await services.skills.list(payload);
                return toRpcResult({ ok: true, value });
            }
            catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case Endpoints.skillsDetail: {
            if (!isSkillDetailRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            try {
                const value = await services.skills.detail(payload);
                return toRpcResult({ ok: true, value });
            }
            catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case Endpoints.toolsList: {
            if (!isToolListRequest(payload))
                return badRequest('invalid payload for ' + endpoint);
            try {
                const value = await services.tools.list(payload);
                return toRpcResult({ ok: true, value });
            }
            catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case 'plan/get': {
            try {
                const tasksDir = path.join(process.env.WORKSPACE_DIR || '/workspace', '.dsh', 'tasks');
                const sid = payload?.sessionId;
                if (sid) {
                    const sessionPlanFile = path.join(tasksDir, 'plans', `${sid}.json`);
                    try {
                        const raw = await fsPromises.readFile(sessionPlanFile, 'utf8');
                        return toRpcResult({ ok: true, value: JSON.parse(raw) });
                    } catch {
                        return toRpcResult({ ok: true, value: { plan_id: null, title: 'Nessun piano attivo per questa sessione', status: 'IDLE', tasks: [] } });
                    }
                }
                const planFile = path.join(tasksDir, 'plan.json');
                let planData = { plan_id: null, title: 'In attesa di piano operativo...', status: 'IDLE', tasks: [] };
                try {
                    const raw = await fsPromises.readFile(planFile, 'utf8');
                    planData = JSON.parse(raw);
                } catch {}
                return toRpcResult({ ok: true, value: planData });
            } catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case 'plan/update': {
            try {
                const tasksDir = path.join(process.env.WORKSPACE_DIR || '/workspace', '.dsh', 'tasks');
                await fsPromises.mkdir(tasksDir, { recursive: true });
                const sid = payload?.sessionId;
                if (sid) {
                    const plansDir = path.join(tasksDir, 'plans');
                    await fsPromises.mkdir(plansDir, { recursive: true });
                    await fsPromises.writeFile(path.join(plansDir, `${sid}.json`), JSON.stringify(payload, null, 2), 'utf8');
                }
                const planFile = path.join(tasksDir, 'plan.json');
                await fsPromises.writeFile(planFile, JSON.stringify(payload, null, 2), 'utf8');
                return toRpcResult({ ok: true, value: payload });
            } catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case 'plan/clear': {
            try {
                const tasksDir = path.join(process.env.WORKSPACE_DIR || '/workspace', '.dsh', 'tasks');
                const sid = payload?.sessionId;
                if (sid) {
                    const sessionPlanFile = path.join(tasksDir, 'plans', `${sid}.json`);
                    try { await fsPromises.unlink(sessionPlanFile); } catch {}
                }
                if (!sid || payload?.all) {
                    const globalPlanFile = path.join(tasksDir, 'plan.json');
                    try { await fsPromises.unlink(globalPlanFile); } catch {}
                    const masterMd = path.join(tasksDir, '00_master_plan.md');
                    try { await fsPromises.unlink(masterMd); } catch {}
                }
                return toRpcResult({ ok: true, value: { plan_id: null, title: 'Piano cancellato', status: 'IDLE', tasks: [] } });
            } catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case 'switchboard/status': {
            try {
                const switchesFile = path.join(process.env.WORKSPACE_DIR || '/workspace', '.dsh', 'switches.json');
                let switches = {
                    searchProvider: 'searxng',
                    osintTools: true,
                    npmGuard: true,
                    theArchitect: true,
                    ephemeralRunners: true
                };
                try {
                    const raw = await fsPromises.readFile(switchesFile, 'utf8');
                    switches = { ...switches, ...JSON.parse(raw) };
                } catch {}
                return toRpcResult({ ok: true, value: switches });
            } catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        case 'switchboard/toggle': {
            try {
                const switchesFile = path.join(process.env.WORKSPACE_DIR || '/workspace', '.dsh', 'switches.json');
                let switches = {
                    searchProvider: 'searxng',
                    osintTools: true,
                    npmGuard: true,
                    theArchitect: true,
                    ephemeralRunners: true
                };
                try {
                    const raw = await fsPromises.readFile(switchesFile, 'utf8');
                    switches = { ...switches, ...JSON.parse(raw) };
                } catch {}
                if (payload && payload.key) {
                    switches[payload.key] = payload.value;
                }
                await fsPromises.mkdir(path.dirname(switchesFile), { recursive: true });
                await fsPromises.writeFile(switchesFile, JSON.stringify(switches, null, 2), 'utf8');
                return toRpcResult({ ok: true, value: switches });
            } catch (e) {
                return toRpcResult({ ok: false, error: e });
            }
        }
        default:
            return badRequest('unknown endpoint ' + endpoint);
    }
}
//# sourceMappingURL=rpc.js.map