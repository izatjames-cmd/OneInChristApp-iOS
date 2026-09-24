import {
  getDanishLanguageAnnouncements
} from './danishLanguageStore.js'

import {
  escapeHtml
} from './danishLanguageFormat.js'


export async function renderDanishLanguageAnnouncements(
  container
) {

  const announcements =
    await getDanishLanguageAnnouncements()

  container.innerHTML =
    `
      <header class="danish-language-page-header">
        <h2>Announcements</h2>
      </header>

      <div class="danish-language-list">
        ${
          announcements.length
            ? announcements
                .map(createAnnouncementMarkup)
                .join('')
            : '<p>No Danish Language announcements at the moment.</p>'
        }
      </div>
    `
}


function createAnnouncementMarkup(
  item
) {

  return `
    <article class="dashboard-card">
      <h3>${escapeHtml(item.title || 'Announcement')}</h3>
      <p>${escapeHtml(item.message || '')}</p>
    </article>
  `
}
