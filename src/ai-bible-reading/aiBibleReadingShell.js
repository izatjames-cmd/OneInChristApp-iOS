/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingShell.js
 *
 * Purpose:
 * Creates the AI Bible Reading shell.
 * ============================================================
 */

export function createAiBibleReadingShell(
  canManage = false
) {

  return `
    <section id="ai-bible-reading-module" class="ai-bible-reading-module">
      <header class="page-header">
        <h2>Bible Reading</h2>
      </header>

      ${
        canManage
          ? `
            <nav
              style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin:16px 0;
              "
            >
              <button type="button" data-ai-bible-reading-tab="reading">
                Reading
              </button>

              <button type="button" data-ai-bible-reading-tab="admin">
                Admin
              </button>
            </nav>
          `
          : ''
      }

      <main id="ai-bible-reading-content"></main>
    </section>
  `
}
