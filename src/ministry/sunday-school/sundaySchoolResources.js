/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolResources.js
 *
 * Purpose:
 * Displays Sunday School resources.
 * ============================================================
 */

import {
  getSundaySchoolResources
} from './sundaySchoolStore.js'


export async function renderSundaySchoolResources(container) {
  const resources = (await getSundaySchoolResources())
    .filter(item => item.active !== false)

  if (!resources.length) {
    container.innerHTML = `
      <section class="sunday-school-resources">
        <h2>Sunday School Resources</h2>
        <p>No Sunday School resources have been published yet.</p>
      </section>
    `
    return
  }

  container.innerHTML = `
    <section class="sunday-school-resources">
      <header class="page-header">
        <h2>Sunday School Resources</h2>
      </header>

      ${resources.map(createResourceMarkup).join('')}
    </section>
  `
}


function createResourceMarkup(item) {
  return `
    <article class="dashboard-card">
      <h3>${escapeHtml(item.title || 'Resource')}</h3>
      <p><strong>Type:</strong> ${escapeHtml(item.type || '')}</p>
      <p>${escapeHtml(item.description || '')}</p>
      ${
        item.link
          ? `
            <p>
              <a href="${escapeAttribute(item.link)}" target="_blank" rel="noopener">
                Open Resource
              </a>
            </p>
          `
          : ''
      }
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
