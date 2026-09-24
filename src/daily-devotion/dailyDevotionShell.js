/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Daily Devotion
 * File   : dailyDevotionShell.js
 *
 * Purpose:
 * Creates the Daily Devotion shell.
 * ============================================================
 */

export function createDailyDevotionShell(
  canManage = false
) {

  return `
    <section id="daily-devotion-module" class="daily-devotion-module">
      <header class="page-header">
        <h2>Daily Devotion</h2>
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
              <button type="button" data-daily-devotion-tab="devotion">
                Devotion
              </button>

              <button type="button" data-daily-devotion-tab="admin">
                Admin
              </button>
            </nav>
          `
          : ''
      }

      <main id="daily-devotion-content"></main>
    </section>
  `
}
