/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerShell.js
 *
 * Purpose:
 * Creates the shell for the Prayer module.
 * ============================================================
 */

export function createPrayerShell(
  canManage = false
) {

  return `
    <section id="prayer-module" class="prayer-module">

      <header class="prayer-header">
        <h1>Prayer</h1>
        <p>Prayer ministry for One In Christ Church.</p>
      </header>

      <nav class="prayer-tabs">
        <button type="button" data-prayer-tab="dashboard">
          Dashboard
        </button>

        <button type="button" data-prayer-tab="requests">
          Prayer Requests
        </button>

        <button type="button" data-prayer-tab="meetings">
          Meetings
        </button>

        <button type="button" data-prayer-tab="announcements">
          Announcements
        </button>

        ${
          canManage
            ? `
              <button type="button" data-prayer-tab="admin">
                Admin
              </button>
            `
            : ''
        }
      </nav>

      <main id="prayer-dashboard"></main>

    </section>
  `
}
