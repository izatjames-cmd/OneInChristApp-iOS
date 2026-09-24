/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolAnnouncements.js
 *
 * Purpose:
 * Renders Sunday School announcements.
 * ============================================================
 */

import {
  getSundaySchoolAnnouncements
} from './sundaySchoolStore.js'


export async function renderSundaySchoolAnnouncements(container) {
  const announcements = await getSundaySchoolAnnouncements()
  const visible = announcements
    .filter(item => item.active !== false)
    .sort((a, b) => Number(b.pinned === true) - Number(a.pinned === true))

  if (!visible.length) {
    container.innerHTML = `
      <section class="sunday-school-announcements">
        <h2>Sunday School Announcements</h2>
        <p>No announcements at the moment.</p>
      </section>
    `
    return
  }

  container.innerHTML = `
    <section class="sunday-school-announcements">
      <header class="page-header">
        <h2>Sunday School Announcements</h2>
      </header>

      ${visible.map(createAnnouncementMarkup).join('')}
    </section>
  `

  bindReadMoreButtons(container, visible)
}


function createAnnouncementMarkup(item) {
  return `
    <article class="announcement-card dashboard-card">
      ${item.pinned === true ? '<strong>Pinned</strong>' : ''}
      <h3>${escapeHtml(item.title || 'Announcement')}</h3>
      <p>${escapeHtml(shortText(item.message))}</p>
      <button type="button" data-sunday-school-announcement="${escapeAttribute(item.id)}">
        Read More
      </button>
    </article>
  `
}


function bindReadMoreButtons(container, announcements) {
  container
    .querySelectorAll('[data-sunday-school-announcement]')
    .forEach(button => button.addEventListener('click', () => {
      const announcement = announcements.find(item => item.id === button.dataset.sundaySchoolAnnouncement)
      if (announcement) openAnnouncementDetails(announcement)
    }))
}


function openAnnouncementDetails(item) {
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.zIndex = '110000'
  overlay.style.background = 'rgba(0,0,0,.55)'
  overlay.style.display = 'flex'
  overlay.style.alignItems = 'center'
  overlay.style.justifyContent = 'center'
  overlay.style.padding = '20px'

  overlay.innerHTML = `
    <article style="width:100%; max-width:430px; max-height:80vh; overflow:auto; background:#fffdf8; border-radius:10px; padding:18px;">
      <h2>${escapeHtml(item.title || 'Announcement')}</h2>
      <p style="white-space:pre-wrap; line-height:1.55;">${escapeHtml(item.message || '')}</p>
      <button type="button" data-close-sunday-school-announcement>Close</button>
    </article>
  `

  overlay
    .querySelector('[data-close-sunday-school-announcement]')
    .addEventListener('click', () => overlay.remove())

  document.body.appendChild(overlay)
}


function shortText(input) {
  const text = String(input || '')
  if (text.length <= 140) return text
  return `${text.slice(0, 140)}...`
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
