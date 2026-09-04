/**
 * dsh-plugin-plan-sidebar
 * Cordis Plugin per DeepSeek Harness (DSH)
 * Sidebar Universale e Comprimibile per il monitoraggio dei Piani e l'ispezione dei Deliverable Intermedi.
 * Agnostica: compatibile con The Architect, Ralph, DSH Todo o qualsiasi altro planner.
 */

import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const TASKS_DIR = path.join(WORKSPACE_DIR, '.dsh', 'tasks');
const PLAN_JSON_FILE = path.join(TASKS_DIR, 'plan.json');
const SIDEBAR_HTML_FILE = path.join(TASKS_DIR, 'plan_sidebar.html');

/**
 * Genera l'HTML autonomo e responsivo della Sidebar Comprimibile
 */
function generateSidebarHtml(planData) {
  const tasks = planData.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter(t => t.status === 'RUNNING' || t.status === 'IN_PROGRESS').length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statusBadge = (st) => {
    switch (st) {
      case 'COMPLETED':
        return '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">COMPLETATO</span>';
      case 'RUNNING':
      case 'IN_PROGRESS':
        return '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">IN CORSO</span>';
      case 'RETRY':
        return '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">RETRY LINTER</span>';
      case 'FAILED':
        return '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">FALLITO</span>';
      default:
        return '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">IN CODA</span>';
    }
  };

  const taskCards = tasks.map((t, idx) => `
    <div class="border border-[var(--border,#334155)] bg-[var(--card,#1e293b)] rounded-lg p-3 transition-all hover:border-slate-400">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-mono text-slate-400">#${idx + 1} ${t.id || `TASK-${idx + 1}`}</span>
        ${statusBadge(t.status)}
      </div>
      <h4 class="text-sm font-medium text-slate-200 mb-1">${t.title || 'Senza titolo'}</h4>
      <div class="text-xs text-slate-400 mb-2 space-y-0.5">
        ${t.assigned_role ? `<div>👤 Ruolo: <span class="text-slate-300 font-mono">${t.assigned_role}</span></div>` : ''}
        ${t.runner ? `<div>⚡ Runner: <span class="text-slate-300 font-mono">${t.runner}</span></div>` : ''}
        ${t.deliverable_file ? `<div>📄 Deliverable: <span class="text-slate-300 font-mono">${t.deliverable_file}</span></div>` : ''}
      </div>
      ${t.deliverable_file ? `
        <details class="mt-2 text-xs">
          <summary class="cursor-pointer text-blue-400 hover:text-blue-300 select-none font-medium">👁️ Mostra Deliverable Intermedio</summary>
          <div class="mt-2 p-2 rounded bg-slate-900/80 border border-slate-700/50 text-slate-300 font-mono text-xs max-h-48 overflow-y-auto whitespace-pre-wrap">
${t.preview_content ? t.preview_content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '(Lettura file su disco: ' + t.deliverable_file + ')'}
          </div>
        </details>
      ` : ''}
      ${t.error_message ? `
        <div class="mt-2 p-2 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
          ⚠️ ${t.error_message}
        </div>
      ` : ''}
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    :root {
      --background: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --foreground: #f8fafc;
    }
  </style>
</head>
<body class="bg-transparent text-[var(--foreground)] antialiased p-3 font-sans">
  <div class="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden max-w-md w-full mx-auto">
    <!-- Header Collapsible Workbench -->
    <div class="px-4 py-3 bg-slate-900/80 border-b border-[var(--border)] flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-base">📋</span>
        <h3 class="font-semibold text-sm text-white tracking-wide">Piano & Task Board</h3>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 font-mono">${planData.plan_id || 'PLAN-001'}</span>
        <button onclick="toggleCollapse()" class="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded border border-slate-700" title="Comprimi / Espandi">◀</button>
      </div>
    </div>

    <!-- Main Container (Collapsible Content) -->
    <div id="sidebar-content" class="p-4 space-y-4">
      <!-- Info Piano -->
      <div>
        <h2 class="text-sm font-semibold text-slate-100 mb-1">${planData.title || 'Piano Operativo Multi-Agente'}</h2>
        ${planData.description ? `<p class="text-xs text-slate-400">${planData.description}</p>` : ''}
      </div>

      <!-- Barra di Progresso -->
      <div class="space-y-1">
        <div class="flex justify-between text-xs font-mono">
          <span class="text-slate-400">Avanzamento Globale</span>
          <span class="text-emerald-400 font-bold">${progressPercent}% (${completed}/${total})</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
          <div class="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
        </div>
      </div>

      <!-- Lista Task -->
      <div class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        ${taskCards || '<p class="text-xs text-slate-500 italic">Nessun task attivo al momento.</p>'}
      </div>

      <!-- Gate di Controllo Utente -->
      <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span class="text-slate-400">Gate di Controllo:</span>
        <div class="flex space-x-2">
          <button class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-all">▶ Approva</button>
          <button class="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-all">⏸ Sospendi</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    let isCollapsed = false;
    function toggleCollapse() {
      isCollapsed = !isCollapsed;
      const content = document.getElementById('sidebar-content');
      if (isCollapsed) {
        content.style.display = 'none';
      } else {
        content.style.display = 'block';
      }
    }
  </script>
</body>
</html>`;
}

export const name = 'plan-sidebar';
export const inject = ['tools'];

export function apply(ctx) {
  if (!ctx.tools || typeof ctx.tools.register !== 'function') return;

  // TOOL 1: plan_sidebar_update (Aperto a qualsiasi Planner)
  ctx.tools.register({
    name: 'plan_sidebar_update',
    description: 'Aggiorna lo stato del piano universale consumabile dalla Plan Sidebar. Aperto a The Architect, Ralph, DSH Todo o custom planners.',
    parameters: {
      plan_id: { type: 'string', required: true, description: 'ID univoco del piano (es. PLAN-01)' },
      title: { type: 'string', required: true, description: 'Titolo descrittivo del piano' },
      description: { type: 'string', required: false, description: 'Descrizione dell\'obiettivo' },
      status: { type: 'string', required: false, description: 'Stato globale: "IN_PROGRESS", "COMPLETED", "PAUSED", "BLOCKED"' },
      tasks: {
        type: 'array',
        required: true,
        description: 'Array di task [{ id, title, status: "PENDING"|"RUNNING"|"COMPLETED"|"FAILED", assigned_role, runner, deliverable_file, error_message }]'
      }
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          sidebar_html: { type: 'string' },
          plan_file: { type: 'string' }
        }
      },
      render: (v) => JSON.stringify(v, null, 2)
    },
    execute: async (args) => {
      try {
        await fs.mkdir(TASKS_DIR, { recursive: true });

        // Arricchisce i task leggendo l'anteprima dei deliverable se già presenti su disco
        const enrichedTasks = await Promise.all((args.tasks || []).map(async (t) => {
          if (t.deliverable_file && t.status === 'COMPLETED') {
            try {
              const fullPath = path.isAbsolute(t.deliverable_file) ? t.deliverable_file : path.join(WORKSPACE_DIR, t.deliverable_file);
              const preview = await fs.readFile(fullPath, 'utf8');
              return { ...t, preview_content: preview.slice(0, 1000) + (preview.length > 1000 ? '\n...[troncato]' : '') };
            } catch {}
          }
          return t;
        }));

        const planPayload = {
          plan_id: args.plan_id,
          title: args.title,
          description: args.description || '',
          status: args.status || 'IN_PROGRESS',
          updated_at: new Date().toISOString(),
          tasks: enrichedTasks
        };

        // Salva plan.json standard
        await fs.writeFile(PLAN_JSON_FILE, JSON.stringify(planPayload, null, 2), 'utf8');

        // Genera plan_sidebar.html
        const html = generateSidebarHtml(planPayload);
        await fs.writeFile(SIDEBAR_HTML_FILE, html, 'utf8');

        return {
          success: true,
          plan_file: PLAN_JSON_FILE,
          sidebar_html: SIDEBAR_HTML_FILE,
          message: `Plan Sidebar aggiornata con successo (${enrichedTasks.length} task registrati).`
        };
      } catch (err) {
        return {
          success: false,
          error: `Errore durante l'aggiornamento della Plan Sidebar: ${err.message}`
        };
      }
    }
  });

  // TOOL 2: plan_sidebar_get
  ctx.tools.register({
    name: 'plan_sidebar_get',
    description: 'Recupera il piano corrente e lo stato di avanzamento in formato JSON universale.',
    parameters: {},
    output: {
      schema: { type: 'object' },
      render: (v) => JSON.stringify(v, null, 2)
    },
    execute: async () => {
      try {
        const raw = await fs.readFile(PLAN_JSON_FILE, 'utf8');
        return JSON.parse(raw);
      } catch {
        return { plan_id: null, tasks: [], status: 'NO_PLAN_ACTIVE' };
      }
    }
  });
}

export default {
  name,
  inject,
  apply,
  generateSidebarHtml
};
