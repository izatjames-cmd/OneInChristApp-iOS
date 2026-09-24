export function createDanishLanguageShell(
  canManage = false
) {

  return `
    <section id="danish-language-module" class="danish-language-module">

      <header class="danish-language-header">
        <h1>Danish Language</h1>
        <p>Danish language courses for nurses, doctors, and healthcare professionals.</p>
      </header>

      <nav class="danish-language-tabs">
        <button type="button" data-danish-language-tab="dashboard">
          Dashboard
        </button>

        <button type="button" data-danish-language-tab="classes">
          Classes
        </button>

        <button type="button" data-danish-language-tab="announcements">
          Announcements
        </button>

        <button type="button" data-danish-language-tab="materials">
          Materials
        </button>

        ${
          canManage
            ? `
              <button type="button" data-danish-language-tab="students">
                Students
              </button>

              <button type="button" data-danish-language-tab="admin">
                Admin
              </button>
            `
            : ''
        }
      </nav>

      <main id="danish-language-dashboard"></main>

    </section>
  `
}
