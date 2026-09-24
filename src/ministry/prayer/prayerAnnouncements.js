/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerAnnouncements.js
 *
 * Purpose:
 * Displays prayer announcements.
 * ============================================================
 */

import {
  getPrayerAnnouncements
} from './prayerStore.js'


export async function renderPrayerAnnouncements(
  container
) {

  const announcements =
    (await getPrayerAnnouncements())
      .filter(
        announcement =>
          announcement.active !== false
      )


  if (!announcements.length) {

    container.innerHTML = `
      <section class="prayer-announcements">
        <h2>Prayer Announcements</h2>
        <p>No prayer announcements at the moment.</p>
      </section>
    `

    return
  }


  const ordered = [
    ...announcements.filter(item => item.pinned === true),
    ...announcements.filter(item => item.pinned !== true)
  ]


  container.innerHTML = `
    <section class="prayer-announcements">
      <header class="page-header">
        <h2>Prayer Announcements</h2>
      </header>

      ${ordered.map(createAnnouncementMarkup).join('')}
    </section>
  `


  bindReadMoreButtons(
    container,
    ordered
  )
}


function createAnnouncementMarkup(
  announcement
) {

  return `
    <article class="announcement-card dashboard-card">
      ${
        announcement.pinned
          ? '<strong>Pinned</strong>'
          : ''
      }

      <h3>${escapeHtml(announcement.title)}</h3>
      <p>${escapeHtml(announcement.message)}</p>

      <button
        type="button"
        data-prayer-announcement-id="${escapeAttribute(announcement.id)}"
      >
        Read More
      </button>
    </article>
  `
}


function bindReadMoreButtons(
  container,
  announcements
) {

  container
    .querySelectorAll('[data-prayer-announcement-id]')
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            const announcement =
              announcements.find(
                item =>
                  item.id ===
                  button.dataset.prayerAnnouncementId
              )


            if (announcement) {
              showPrayerAnnouncementDetails(
                announcement
              )
            }
          }
        )
      }
    )
}


function showPrayerAnnouncementDetails(
  announcement
) {

  const overlay =
    document.createElement('div')

  overlay.style.position =
    'fixed'
  overlay.style.inset =
    '0'
  overlay.style.zIndex =
    '110000'
  overlay.style.background =
    'rgba(0,0,0,.55)'
  overlay.style.display =
    'flex'
  overlay.style.alignItems =
    'center'
  overlay.style.justifyContent =
    'center'
  overlay.style.padding =
    '20px'

  overlay.innerHTML = `
    <article
      style="
        width:100%;
        max-width:430px;
        max-height:85vh;
        overflow-y:auto;
        background:#fffdf8;
        border-radius:12px;
        padding:20px;
        box-sizing:border-box;
        font-family:Arial,sans-serif;
      "
    >
      <h2 style="margin-top:0;">${escapeHtml(announcement.title)}</h2>
      <p style="white-space:pre-wrap;">${escapeHtml(announcement.message)}</p>
      <button type="button" data-close-prayer-announcement style="width:100%; padding:12px; margin-top:12px;">
        Close
      </button>
    </article>
  `

  overlay
    .querySelector('[data-close-prayer-announcement]')
    .addEventListener(
      'click',
      () => overlay.remove()
    )

  document.body.appendChild(overlay)
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
