import {
  getDanishLanguageClasses
} from './danishLanguageStore.js'

import {
  escapeHtml,
  formatDateTime
} from './danishLanguageFormat.js'


export async function renderDanishLanguageClasses(
  container
) {

  const classes =
    await getDanishLanguageClasses()

  container.innerHTML =
    `
      <header class="danish-language-page-header">
        <h2>Classes</h2>
      </header>

      <div class="danish-language-list">
        ${
          classes.length
            ? classes
                .map(createClassMarkup)
                .join('')
            : '<p>No Danish classes have been created yet.</p>'
        }
      </div>
    `
}


function createClassMarkup(
  item
) {

  return `
    <article class="dashboard-card">
      <h3>${escapeHtml(item.title || item.course || 'Danish Class')}</h3>
      <p><strong>${escapeHtml(formatDateTime(item.date, item.time))}</strong></p>
      <p>${escapeHtml(item.teacher || '')}</p>
      <p>${escapeHtml(item.classroom || '')}</p>
      <p>${escapeHtml(item.lessonTopic || item.description || '')}</p>
      ${
        item.zoomLink
          ? `<p><a href="${escapeHtml(item.zoomLink)}" target="_blank" rel="noreferrer">Open Zoom Link</a></p>`
          : ''
      }
    </article>
  `
}
