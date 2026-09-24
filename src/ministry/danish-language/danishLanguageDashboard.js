import {
  getUpcomingDanishLanguageClass,
  getLatestDanishLanguageAnnouncement,
  getLatestDanishLanguageMaterial
} from './danishLanguageStore.js'

import {
  escapeHtml,
  formatDateTime
} from './danishLanguageFormat.js'


export async function renderDanishLanguageDashboard(
  container
) {

  const [
    nextClass,
    latestAnnouncement,
    latestMaterial
  ] =
    await Promise.all([
      getUpcomingDanishLanguageClass(),
      getLatestDanishLanguageAnnouncement(),
      getLatestDanishLanguageMaterial()
    ])

  container.innerHTML =
    `
      <section class="dashboard-card">
        <h2>Welcome</h2>
        <p>Danish language learning support for healthcare professionals.</p>
      </section>

      <section class="dashboard-card">
        <h3>Next Class</h3>
        ${
          nextClass
            ? `
              <strong>${escapeHtml(nextClass.title || nextClass.course || 'Danish Class')}</strong>
              <p>${escapeHtml(formatDateTime(nextClass.date, nextClass.time))}</p>
              <p>${escapeHtml(nextClass.teacher || '')}</p>
            `
            : '<p>No upcoming Danish class has been created yet.</p>'
        }
      </section>

      <section class="dashboard-card">
        <h3>Latest Announcement</h3>
        ${
          latestAnnouncement
            ? `
              <strong>${escapeHtml(latestAnnouncement.title)}</strong>
              <p>${escapeHtml(latestAnnouncement.message)}</p>
            `
            : '<p>No Danish Language announcement at the moment.</p>'
        }
      </section>

      <section class="dashboard-card">
        <h3>Latest Material</h3>
        ${
          latestMaterial
            ? `
              <strong>${escapeHtml(latestMaterial.title)}</strong>
              <p>${escapeHtml(latestMaterial.description)}</p>
            `
            : '<p>No course material has been added yet.</p>'
        }
      </section>
    `
}
