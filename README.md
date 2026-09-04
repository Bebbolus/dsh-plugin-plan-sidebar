# dsh-plugin-plan-sidebar

Universal Collapsible Right-Dock Workbench Sidebar for **DeepSeek Harness (DSH)** and **Cordis**.

Provides a responsive right-dock sidebar occupying the frame's `details` column with native drag-resize, left-footer toggle button, keyboard shortcut (`Ctrl/Cmd+Shift+B`), and an extensible tab registry.

---

## 🚀 Caratteristiche & Tab Integrati

1. **📋 Piano & Task Board (Tab 1 - Priority Order 5):**
   - **Avanzamento in Tempo Reale:** Barra di progresso dinamica percentuale e contatore completamento `(X/Y)`.
   - **Task Cards Interattive:** Monitora ogni task con badge di stato colorati (`COMPLETED`, `RUNNING`, `RETRY`, `FAILED`, `PENDING`).
   - **Ispezione Deliverable Intermedi:** Cliccando sul deliverable intermedio di un task, visualizza l'anteprima del file prodotto (`.dsh/tasks/task_XX_result.md`) direttamente nella sidebar senza uscire dalla conversazione.
   - **Gate di Controllo:** Pulsanti per Approvare (`▶ Approva`) o Sospendere (`⏸ Sospendi`) il piano.

2. **🎛️ Cordis Switchboard (Tab 2 - Priority Order 10):**
   - **Filtro di Ricerca Live:** Cerca istantaneamente plugin, tool e provider attivi.
   - **Web Search Provider Toggle:** Passa con un clic da **SearXNG OSINT** a **Default Web Search**.
   - **OSINT & Intelligence Toggles:** Attiva/disattiva Agent-Reach, YouTube Transcripts, Scraper.
   - **Security & Execution Toggles:** Controllo per NPM Guard e The Architect.
   - **Isolamento Per-Session:** Ogni sessione o turn di conversazione mantiene il proprio stato di toggle in `.dsh/switches.json`.

3. **📁 Explorer (Workspace File Tree - Order 20):**
   - Albero dei file del workspace con navigazione rapida e visualizzazione file diff.

4. **🌿 Git (Source Control - Order 30):**
   - Stato modifiche, staging, visualizzazione diff side-by-side e storico commit.

5. **⚡ Skills & Tools (Order 40 & 50):**
   - Catalogo delle skill caricate e registro strumenti disponibili.

---

## 📦 Installazione Canonica in DeepSeek Harness

Esegui dal terminale di DSH o dal container:

```bash
dsh plugin --profile web add dsh-plugin-plan-sidebar
```

DSH riconosce automaticamente la dichiarazione `dsh.bundle.patch` in `package.json`, inserisce il bundle in `dsh.profile.bundles` del profilo web e carica il client bundle nella Web GUI.

Oppure tramite patch manuale in `cordis.patch.yml`:
```yaml
- insert:
    - id: dsh-plugin-plan-sidebar
      name: 'dsh-plugin-plan-sidebar'
```

---

## 🔌 Estensibilità Tab (`ctx.betterSidebar`)

Il plugin espone il servizio `betterSidebar` nel context Cordis client. Qualsiasi plugin terzo può registrare tab personalizzati:

```typescript
ctx.inject(['betterSidebar'], (innerCtx) => {
  innerCtx.betterSidebar.tabs.register({
    id: 'my-custom-tab',
    order: 15,
    label: () => 'Mio Tab',
    icon: <MyIcon />,
    renderPanel: () => <MyPanel />
  });
});
```

---

## 🌐 Pubblicazione su dsh-plugin.org & npm

1. **Tag e Release su GitHub:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. **Pubblicazione npm:**
   ```bash
   npm publish --access public
   ```
3. **Indicizzazione:**
   Il marketplace `https://dsh-plugin.org` rileva automaticamente i pacchetti npm aventi la keyword `dsh-plugin` e il manifest `dsh.bundle`.

---

## Licenza
MIT © Bebbolus
