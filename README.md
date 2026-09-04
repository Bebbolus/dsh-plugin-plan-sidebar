# dsh-plugin-plan-sidebar

Universal Collapsible Plan & Task Execution Workbench for **DeepSeek Harness (DSH)** and **Cordis**.

## Caratteristiche

* **Agnostico & Aperto:** Non legato a un singolo planner. Consuma qualsiasi piano conforme a `PlanProviderContract` (The Architect, Ralph, DSH native Todo o planner custom).
* **Sidebar a Scomparsa (Collapsible):** Permette all'utente di comprimere o espandere il tab con un clic, mantenendo la chat pulita.
* **Ispezione Deliverable Intermedi:** Cliccando su un task completato, espande il markdown del risultato intermedio (`task_XX_result.md`) direttamente nella sidebar.
* **Barra di Progresso Dinamica:** Calcola la percentuale di completamento in tempo reale basandosi sui task validati.
* **Gate di Controllo Utente:** Pulsanti integrati per approvare, sospendere o modificare gli step del piano.

## Contratto di Piano (`PlanProviderContract`)

Qualsiasi planner può aggiornare la sidebar invocando il tool `plan_sidebar_update` o scrivendo su `.dsh/tasks/plan.json`:

```json
{
  "plan_id": "PLAN-001",
  "title": "Creazione Monografia OKF",
  "status": "IN_PROGRESS",
  "tasks": [
    {
      "id": "TASK-01",
      "title": "Ingestion e Ricerca Fonti",
      "status": "COMPLETED",
      "assigned_role": "explorer",
      "runner": "native",
      "deliverable_file": ".dsh/tasks/task_01_result.md"
    },
    {
      "id": "TASK-02",
      "title": "Compilazione Bozza",
      "status": "RUNNING",
      "assigned_role": "curator",
      "runner": "dsh_runner_python",
      "deliverable_file": ".dsh/tasks/task_02_draft.md"
    }
  ]
}
```

## Installazione in DSH

In `cordis.patch.yml`:
```yaml
- insert:
    - id: plan-sidebar
      name: 'dsh-plugin-plan-sidebar'
```

## Licenza
MIT
