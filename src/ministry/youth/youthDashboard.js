/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Youth
 * File   : youthDashboard.js
 *
 * Purpose:
 * Displays the Youth Dashboard.
 * ============================================================
 */

import {
  getUpcomingEvent,
  getLatestAnnouncement
} from './youthStore.js'

import {
  getApprovedDailyDevotion
} from '../../daily-devotion/dailyDevotionStore.js'

import {
  createDailyDevotionSummary
} from '../../daily-devotion/dailyDevotionUI.js'

import {
  showYouthAnnouncementDetails
} from './youthAnnouncementDetails.js'


export async function renderYouthDashboard(
  container
) {

  const devotion =
    await getApprovedDailyDevotion()

  const upcomingEvent =
    await getUpcomingEvent()

  const latestAnnouncement =
    await getLatestAnnouncement()


  container.innerHTML = `
    <section class="youth-dashboard">

      <section class="dashboard-card">
        <h2>Welcome</h2>
        <p>Welcome to the One In Christ Youth Fellowship.</p>
      </section>

      <section class="dashboard-card">
        <h2>Daily Devotion</h2>
        ${createDailyDevotionSummary(devotion)}
      </section>

      <section class="dashboard-card">
        <h2>Upcoming Event</h2>
        ${
          upcomingEvent
            ? createEventSummary(upcomingEvent)
            : '<p>No upcoming youth events.</p>'
        }
      </section>

      <section class="dashboard-card">
        <h2>Latest Announcement</h2>
        ${
          latestAnnouncement
            ? `
              <h3>${escapeHtml(latestAnnouncement.title)}</h3>
              <p>${escapeHtml(latestAnnouncement.message)}</p>
              <button
                type="button"
                data-youth-latest-announcement
              >
                Read More
              </button>
            `
            : '<p>No announcements at the moment.</p>'
        }
      </section>

    </section>
  `


  bindLatestAnnouncementButton(
    container,
    latestAnnouncement
  )
}


function createEventSummary(
  event
) {

  return `
    <article data-youth-event-card>
      ${
        event.image
          ? `
            <img
              src="${escapeAttribute(event.image)}"
              alt=""
              style="width:100%; border-radius:8px; margin-bottom:10px;"
            >
          `
          : ''
      }

      <h3>${escapeHtml(event.title)}</h3>
      <p><strong>Date:</strong> ${escapeHtml(event.date)}</p>
      <p><strong>Time:</strong> ${escapeHtml(event.time)}</p>
      <p><strong>Location:</strong> ${escapeHtml(event.location)}</p>

      <div class="event-actions">
        <button type="button" data-youth-tab="events">
          View Details
        </button>
        <button
          type="button"
          data-youth-event-id="${escapeAttribute(event.id)}"
          data-youth-response="coming"
        >
          I'm Coming
        </button>
        <button
          type="button"
          data-youth-event-id="${escapeAttribute(event.id)}"
          data-youth-response="notComing"
        >
          Can't Come
        </button>
      </div>

      <div data-youth-event-status style="min-height:18px; margin-top:8px;"></div>
    </article>
  `
}


function bindLatestAnnouncementButton(
  container,
  announcement
) {

  if (!announcement) {
    return
  }


  const button =
    container.querySelector(
      '[data-youth-latest-announcement]'
    )


  if (!button) {
    return
  }


  button.addEventListener(
    'click',
    () => {

      showYouthAnnouncementDetails(
        announcement
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
