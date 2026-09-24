import {
  getDanishLanguageStudents
} from './danishLanguageStore.js'

import {
  escapeHtml
} from './danishLanguageFormat.js'


export async function renderDanishLanguageStudents(
  container
) {

  const students =
    await getDanishLanguageStudents()

  container.innerHTML =
    `
      <header class="danish-language-page-header">
        <h2>Students</h2>
        <p>Students may be church members or outside students.</p>
      </header>

      <div class="danish-language-list">
        ${
          students.length
            ? students
                .map(createStudentMarkup)
                .join('')
            : '<p>No Danish Language students have been added yet.</p>'
        }
      </div>
    `
}


function createStudentMarkup(
  item
) {

  return `
    <article class="dashboard-card">
      <h3>${escapeHtml(item.name || 'Student')}</h3>
      <p>${escapeHtml(item.course || '')}</p>
      <p>${escapeHtml(item.teacher || '')}</p>
      <p>${escapeHtml(item.phone || '')}</p>
      <p>${escapeHtml(item.email || '')}</p>
      <p>${escapeHtml(item.notes || '')}</p>
    </article>
  `
}
