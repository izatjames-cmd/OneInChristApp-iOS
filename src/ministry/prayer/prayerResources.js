/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerResources.js
 *
 * Purpose:
 * Displays prayer resources.
 * ============================================================
 */

import {
  getPrayerResources
} from './prayerStore.js'


export async function renderPrayerResources(
  container
) {

  const resources =
    (await getPrayerResources())
      .filter(
        resource =>
          resource.active !== false
      )


  if (!resources.length) {

    container.innerHTML = `
      <section class="prayer-resources">
        <h2>Prayer Resources</h2>
        <p>No prayer resources have been published yet.</p>
      </section>
    `

    return
  }


  container.innerHTML = `
    <section class="prayer-resources">
      <header class="page-header">
        <h2>Prayer Resources</h2>
      </header>

      ${resources.map(createResourceMarkup).join('')}
    </section>
  `
}


function createResourceMarkup(
  resource
) {

  return `
    <article class="dashboard-card">
      <h3>${escapeHtml(resource.title)}</h3>
      <p><strong>Type:</strong> ${escapeHtml(resource.type)}</p>
      <p>${escapeHtml(resource.description)}</p>

      ${
        resource.link
          ? `
            <p>
              <a href="${escapeAttribute(resource.link)}" target="_blank" rel="noopener">
                Open Resource
              </a>
            </p>
          `
          : ''
      }
    </article>
  `
}


function escapeHtml(input) {

  return String(input || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}


function escapeAttribute(input) {
  return escapeHtml(input)
}
