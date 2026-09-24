/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolEvents.js
 *
 * Purpose:
 * Renders Sunday School classes.
 * ============================================================
 */

import {
  getSundaySchoolClasses
} from './sundaySchoolStore.js'


export async function renderSundaySchoolEvents(container) {
  const classes = await getSundaySchoolClasses()

  if (!classes.length) {
    container.innerHTML = `
      <section class="sunday-school-classes">
        <h2>Sunday School Classes</h2>
        <p>No Sunday School classes have been created yet.</p>
      </section>
    `
    return
  }

  container.innerHTML = `
    <section class="sunday-school-classes">
      <header class="page-header">
        <h2>Sunday School Classes</h2>
      </header>

      ${classes
        .filter(item => item.active !== false)
        .map(createClassMarkup)
        .join('')}
    </section>
  `
}


function createClassMarkup(item) {
  return `
    <article class="sunday-school-card dashboard-card">
      ${item.image ? `<img src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.title || 'Sunday School class')}">` : ''}
      <h3>${escapeHtml(item.title || 'Sunday School Class')}</h3>
      <p>${escapeHtml(item.description || '')}</p>
      <p><strong>Teacher:</strong> ${escapeHtml(item.teacher || '')}</p>
      ${item.assistantTeacher ? `<p><strong>Assistant Teacher:</strong> ${escapeHtml(item.assistantTeacher)}</p>` : ''}
      <p><strong>Age Group:</strong> ${escapeHtml(item.ageGroup || '')}</p>
      <p><strong>Date:</strong> ${escapeHtml(item.date || '')} ${escapeHtml(item.time || '')}</p>
      <p><strong>Room:</strong> ${escapeHtml(item.room || '')}</p>
    </article>
  `
}


function escapeAttribute(input) {
  return escapeHtml(input)
}


function escapeHtml(input) {
  return String(input || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
