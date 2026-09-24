/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerDashboard.js
 *
 * Purpose:
 * Displays the Prayer dashboard.
 * ============================================================
 */

import {
  getLatestApprovedPrayerRequest,
  getUpcomingPrayerMeeting,
  getLatestPrayerAnnouncement
} from './prayerStore.js'


export async function renderPrayerDashboard(
  container
) {

  const request =
    await getLatestApprovedPrayerRequest()

  const meeting =
    await getUpcomingPrayerMeeting()

  const announcement =
    await getLatestPrayerAnnouncement()


  container.innerHTML = `
    <section class="prayer-dashboard">

      <section class="dashboard-card">
        <h2>Welcome</h2>
        <p>Welcome to the prayer ministry of One In Christ Church.</p>
      </section>

      <section class="dashboard-card">
        <h2>Prayer Requests</h2>
        ${
          request
            ? `
              <h3>${escapeHtml(request.category || 'Prayer Request')}</h3>
              <p>${escapeHtml(request.request)}</p>
            `
            : '<p>No approved church-wide prayer requests.</p>'
        }
      </section>

      <section class="dashboard-card">
        <h2>Upcoming Prayer Meeting</h2>
        ${
          meeting
            ? `
              <h3>${escapeHtml(meeting.title)}</h3>
              <p><strong>Date:</strong> ${escapeHtml(meeting.date)}</p>
              <p><strong>Time:</strong> ${escapeHtml(meeting.time)}</p>
              <p><strong>Location:</strong> ${escapeHtml(meeting.location)}</p>
              <button type="button" data-prayer-tab="meetings">
                View Details
              </button>
            `
            : '<p>No upcoming prayer meeting.</p>'
        }
      </section>

      <section class="dashboard-card">
        <h2>Latest Announcement</h2>
        ${
          announcement
            ? `
              <h3>${escapeHtml(announcement.title)}</h3>
              <p>${escapeHtml(announcement.message)}</p>
              <button type="button" data-prayer-tab="announcements">
                Read More
              </button>
            `
            : '<p>No prayer announcements at the moment.</p>'
        }
      </section>

    </section>
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
