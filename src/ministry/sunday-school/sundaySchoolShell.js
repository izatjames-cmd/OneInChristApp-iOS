/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolShell.js
 *
 * Purpose:
 * Creates the Sunday School module shell.
 * ============================================================
 */

export function createSundaySchoolShell(canManage = false) {
  return `
    <section id="sunday-school-module" class="sunday-school-module">
      <header class="sunday-school-header">
        <h1>Sunday School</h1>
        <p>Children's ministry for One In Christ Church.</p>
      </header>

      <nav class="sunday-school-tabs">
        <button type="button" data-sunday-school-tab="dashboard">Dashboard</button>
        <button type="button" data-sunday-school-tab="classes">Classes</button>
        <button type="button" data-sunday-school-tab="announcements">Announcements</button>
        <button type="button" data-sunday-school-tab="resources">Resources</button>
        <button type="button" data-sunday-school-tab="gallery">Gallery</button>
        <button type="button" data-sunday-school-tab="teachers">Teachers</button>
        ${
          canManage
            ? '<button type="button" data-sunday-school-tab="admin">Admin</button><button type="button" data-sunday-school-tab="create-gallery">Create Gallery</button>'
            : ''
        }
      </nav>

      <main id="sunday-school-dashboard"></main>
    </section>
  `
}
