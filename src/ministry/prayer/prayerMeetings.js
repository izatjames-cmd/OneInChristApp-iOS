/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerMeetings.js
 *
 * Purpose:
 * Displays prayer meetings.
 * ============================================================
 */

import {
  getPrayerMeetings,
  getPrayerMeetingResponses
} from './prayerStore.js'


export async function renderPrayerMeetings(
  container
) {

  const meetings =
    (await getPrayerMeetings())
      .filter(
        meeting =>
          meeting.active !== false
      )


  if (!meetings.length) {

    container.innerHTML = `
      <section class="prayer-meetings">
        <h2>Prayer Meetings</h2>
        <p>No prayer meetings have been created yet.</p>
      </section>
    `

    return
  }


  const meetingCards =
    await Promise.all(
      meetings.map(
        async meeting => {

          const responses =
            await getPrayerMeetingResponses(
              meeting.id
            )


          return createMeetingMarkup(
            meeting,
            responses
          )
        }
      )
    )


  container.innerHTML = `
    <section class="prayer-meetings">
      <header class="page-header">
        <h2>Prayer Meetings</h2>
      </header>

      ${meetingCards.join('')}
    </section>
  `
}


function createMeetingMarkup(
  meeting,
  responses = []
) {

  return `
    <article class="event-card dashboard-card" data-prayer-meeting-card>
      <h3>${escapeHtml(meeting.title)}</h3>
      <p><strong>Date:</strong> ${escapeHtml(meeting.date)}</p>
      <p><strong>Time:</strong> ${escapeHtml(meeting.time)}</p>
      <p><strong>Location:</strong> ${escapeHtml(meeting.location)}</p>

      ${
        meeting.leader
          ? `<p><strong>Leader:</strong> ${escapeHtml(meeting.leader)}</p>`
          : ''
      }

      ${
        meeting.description
          ? `<p>${escapeHtml(meeting.description)}</p>`
          : ''
      }

      ${
        meeting.onlineLink
          ? `
            <p>
              <a href="${escapeAttribute(meeting.onlineLink)}" target="_blank" rel="noopener">
                Open online meeting
              </a>
            </p>
          `
          : ''
      }

      ${
        meeting.notes
          ? `<p><strong>Notes:</strong> ${escapeHtml(meeting.notes)}</p>`
          : ''
      }

      ${createAttendanceMarkup(responses)}

      <div class="event-actions">
        <button
          type="button"
          data-prayer-meeting-id="${escapeAttribute(meeting.id)}"
          data-prayer-response="coming"
        >
          I'm Coming
        </button>

        <button
          type="button"
          data-prayer-meeting-id="${escapeAttribute(meeting.id)}"
          data-prayer-response="notComing"
        >
          Can't Come
        </button>
      </div>

      <div data-prayer-meeting-status style="min-height:18px; margin-top:8px;"></div>
    </article>
  `
}


function createAttendanceMarkup(
  responses
) {

  const coming =
    responses.filter(
      item =>
        item.response === 'coming'
    )


  const names =
    coming
      .map(
        item =>
          item.name ||
          'Member'
      )
      .filter(Boolean)


  return `
    <div class="prayer-attendance dashboard-card">
      <strong>Coming: ${coming.length}</strong>

      ${
        names.length
          ? `
            <p>
              ${names.map(escapeHtml).join(', ')}
            </p>
          `
          : '<p>No one has responded yet.</p>'
      }
    </div>
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
