# dsh-plugin-plan-sidebar 📋

[![npm version](https://img.shields.io/npm/v/dsh-plugin-plan-sidebar.svg)](https://www.npmjs.com/package/dsh-plugin-plan-sidebar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![DSH Plugin Hub](https://img.shields.io/badge/DSH--Plugin-UI--Workbench-green.svg)](https://dsh-plugin.org)

Universal Collapsible Right-Dock Workbench Sidebar for **DeepSeek Harness (DSH)** and **Cordis**.

Provides an integrated, multi-tab workbench sidebar occupying the frame's `details` column with native drag-resize width persistence, a left-footer toggle button matching DSH Settings pixel-for-pixel, keyboard shortcut (`Ctrl/Cmd+Shift+B`), full Day/Night mode theme support, and an extensible tab registry.

---

## 🌟 Key Features & Integrated Tabs

1. **📋 Plan & Task Board (Tab 1 - Priority Order 5):**
   - **Real-Time Progress Tracking:** Dynamic percentage progress bar and task completion counter `(X/Y)`.
   - **Interactive Task Cards:** Live status badges (`COMPLETED`, `RUNNING`, `RETRY`, `FAILED`, `PENDING`), assigned agent roles, and Docker runners.
   - **Intermediate Deliverable Inspector:** Click any task deliverable to instantly expand and preview the generated markdown report (`.dsh/tasks/task_XX_result.md`) directly in the sidebar without leaving your conversation.
   - **Gate Controls:** Interactive buttons to Approve (`▶ Approve`) or Suspend (`⏸ Suspend`) execution at gate checkpoints.

2. **🎛️ Cordis Switchboard (Tab 2 - Priority Order 10):**
   - **Instant Search:** Filter active tools, plugins, and providers in real time.
   - **Web Search Provider Toggle:** Switch on the fly between **SearXNG OSINT** and **Default Web Search**.
   - **OSINT & Intelligence Toggles:** Toggle Agent-Reach, YouTube Transcripts, Scrapers per turn.
   - **Per-Session State:** Each conversation maintains its isolated toggle configuration in `.dsh/switches.json`.

3. **📁 Workspace File Explorer (Order 20):**
   - Fast file tree navigation for the entire workspace (`apps/`, `vault/`, `.dsh/tasks/`) with inline markdown preview and side-by-side diffs.

4. **🌿 Git Version Control (Order 30):**
   - Modified file status, file staging, visual side-by-side diff viewer, and commit history.

5. **⚡ Skills & Tools Catalogs (Order 40 & 50):**
   - Live browser of installed skill blueprints and registered Cordis runtime tools.

6. **🎨 Pixel-Perfect Styling & Theme Integration:**
   - **Footer Toggle Button:** Styled to match DSH Settings (`42px` height, `12px` border radius, outline panel SVG icon, identical hover/active states).
   - **Canonical Theme Tokens:** Built with `--bsd-fg`, `--bsd-fg-muted`, `--bsd-bg-raised`, and `--bsd-border` for contrast in both Dark and Light ("Day") modes.

---

## 📦 Installation in DeepSeek Harness

Run from your DSH terminal or container environment:

```bash
dsh plugin --profile web add dsh-plugin-plan-sidebar
```

DSH automatically discovers the `dsh.bundle.patch` declaration in `package.json`, registers the bundle in `dsh.profile.bundles`, and injects the client bundle into the Web GUI.

Or configure manually in `cordis.patch.yml`:

```yaml
- insert:
    - id: dsh-plugin-plan-sidebar
      name: 'dsh-plugin-plan-sidebar'
```

---

## 🔌 Tab Extensibility (`ctx.betterSidebar`)

The plugin registers a client-side `betterSidebar` service. Any third-party Cordis plugin can contribute custom tabs:

```typescript
ctx.inject(['betterSidebar'], (innerCtx) => {
  innerCtx.betterSidebar.tabs.register({
    id: 'my-custom-tab',
    order: 15,
    label: () => 'My Custom Tab',
    icon: <MyIcon />,
    renderPanel: () => <MyPanel />
  });
});
```

---

## 🚀 Publishing to dsh-plugin.org & npm

1. **Tag and Release on GitHub:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. **Publish to npm:**
   ```bash
   npm publish --access public
   ```
3. **Registry Discovery:**
   `https://dsh-plugin.org` automatically indexes packages carrying the `dsh-plugin` keyword and the `dsh.bundle` manifest.

---

## 📄 License

MIT © Bebbolus
