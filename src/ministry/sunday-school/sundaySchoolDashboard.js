/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolDashboard.js
 *
 * Purpose:
 * Renders the Sunday School dashboard.
 * ============================================================
 */

import {
  getApprovedDailyDevotion
} from '../../daily-devotion/dailyDevotionStore.js'

import {
  openDailyDevotionSection
} from '../../daily-devotion/dailyDevotionUI.js'

import {
  getUpcomingSundaySchoolClass,
  getLatestSundaySchoolAnnouncement,
  getLatestSundaySchoolResource
} from './sundaySchoolStore.js'


export async function renderSundaySchoolDashboard(container) {
  const devotion = await getApprovedDailyDevotion()
  const upcomingClass = await getUpcomingSundaySchoolClass()
  const announcement = await getLatestSundaySchoolAnnouncement()
  const resource = await getLatestSundaySchoolResource()

  container.innerHTML = `
    <section class="sunday-school-dashboard">
      <section class="dashboard-card">
        <h2>Welcome</h2>
        <p>Welcome to One In Christ Sunday School.</p>
      </section>

      <section class="dashboard-card">
        <h2>Today's Daily Devotion</h2>
        ${createDevotionSummary(devotion)}
      </section>

      <section class="dashboard-card">
        <h2>Upcoming Sunday School Class</h2>
        ${upcomingClass ? createClassSummary(upcomingClass) : '<p>No upcoming Sunday School class.</p>'}
      </section>

      <section class="dashboard-card">
        <h2>Latest Announcement</h2>
        ${announcement ? createAnnouncementSummary(announcement) : '<p>No announcements at the moment.</p>'}
      </section>

      <section class="dashboard-card">
        <h2>This Week's Resources</h2>
        ${resource ? createResourceSummary(resource) : '<p>No resources have been published yet.</p>'}
      </section>
    </section>
  `

  bindDailyDevotionButton(container)
}


function createDevotionSummary(devotion) {
  if (!devotion) return '<p>No devotion has been approved yet.</p>'

  return `
    <p><strong>${escapeHtml(devotion.verseReference || 'Bible Verse')}</strong></p>
    <p>${escapeHtml(devotion.verseText || '')}</p>
    <button type="button" data-open-daily-devotion>
      Read Devotion
    </button>
  `
}


function bindDailyDevotionButton(container) {
  container
    .querySelector('[data-open-daily-devotion]')
    ?.addEventListener('click', async () => {
      await openDailyDevotionSection()
    })
}


function createClassSummary(item) {
  return `
    <p><strong>${escapeHtml(item.title || 'Sunday School Class')}</strong></p>
    <p>${escapeHtml(item.date || '')} ${escapeHtml(item.time || '')}</p>
    <p>${escapeHtml(item.room || '')}</p>
    <button type="button" data-sunday-school-tab="classes">View Details</button>
  `
}


function createAnnouncementSummary(item) {
  return `
    <p><strong>${escapeHtml(item.title || 'Announcement')}</strong></p>
    <p>${escapeHtml(item.message || '')}</p>
    <button type="button" data-sunday-school-tab="announcements">Read More</button>
  `
}


function createResourceSummary(item) {
  return `
    <p><strong>${escapeHtml(item.title || 'Resource')}</strong></p>
    <p>${escapeHtml(item.description || '')}</p>
    <button type="button" data-sunday-school-tab="resources">Open Resources</button>
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
