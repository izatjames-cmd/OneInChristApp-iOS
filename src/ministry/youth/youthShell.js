/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Youth
 * File   : youthShell.js
 *
 * Purpose:
 * Creates the shell for the Youth module.
 * ============================================================
 */

export function createYouthShell(
  canManage = false
) {

  return `
    <section id="youth-module" class="youth-module">

      <header class="youth-header">
        <h1>Youth</h1>
        <p>Welcome to the One In Christ Youth Fellowship.</p>
      </header>

      <nav
        style="
          display:grid;
          grid-template-columns:repeat(2, 1fr);
          gap:8px;
          margin:16px 0;
        "
      >
        <button type="button" data-youth-tab="dashboard">
          Dashboard
        </button>

        <button type="button" data-youth-tab="devotion">
          Daily Devotion
        </button>

        <button type="button" data-youth-tab="events">
          Events
        </button>

        <button type="button" data-youth-tab="announcements">
          Announcements
        </button>

        ${
          canManage
            ? `
              <button type="button" data-youth-tab="admin">
                Admin
              </button>
            `
            : ''
        }
      </nav>

      <main id="youth-dashboard"></main>

    </section>
  `
}
