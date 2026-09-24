/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Youth
 * File   : youthAnnouncements.js
 *
 * Purpose:
 * Displays youth announcements.
 * ============================================================
 */

import {
  getYouthAnnouncements
} from './youthStore.js'

import {
  showYouthAnnouncementDetails
} from './youthAnnouncementDetails.js'


export async function renderYouthAnnouncements(
  container
) {

  const announcements =
    (await getYouthAnnouncements())
      .filter(
        announcement =>
          announcement.active !== false
      )


  if (!announcements.length) {

    container.innerHTML = `
      <section class="youth-announcements">
        <h2>Youth Announcements</h2>
        <p>No announcements at the moment.</p>
      </section>
    `

    return
  }


  const pinned =
    announcements.filter(
      announcement =>
        announcement.pinned === true
    )


  const normal =
    announcements.filter(
      announcement =>
        announcement.pinned !== true
    )


  const orderedAnnouncements = [
    ...pinned,
    ...normal
  ]


  container.innerHTML = `
    <section class="youth-announcements">
      <header class="page-header">
        <h2>Youth Announcements</h2>
      </header>

      ${
        orderedAnnouncements
          .map(
            createAnnouncementMarkup
          )
          .join('')
      }
    </section>
  `


  bindReadMoreButtons(
    container,
    orderedAnnouncements
  )
}


function createAnnouncementMarkup(
  announcement
) {

  return `
    <article class="announcement-card dashboard-card">
      ${
        announcement.pinned === true
          ? '<strong>Pinned</strong>'
          : ''
      }

      <h3>${escapeHtml(announcement.title)}</h3>
      <p>${escapeHtml(announcement.message)}</p>

      <button
        type="button"
        data-youth-announcement-id="${escapeAttribute(
          announcement.id
        )}"
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
    .querySelectorAll(
      '[data-youth-announcement-id]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            const announcement =
              announcements.find(
                item =>
                  item.id ===
                  button.dataset.youthAnnouncementId
              )


            if (announcement) {

              showYouthAnnouncementDetails(
                announcement
              )
            }
          }
        )
      }
    )
}


function escapeHtml(
  input
) {

  return String(
    input || ''
  )
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}


function escapeAttribute(
  input
) {

  return escapeHtml(
    input
  )
}
