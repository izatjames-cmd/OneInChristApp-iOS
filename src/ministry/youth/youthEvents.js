/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Youth
 * File   : youthEvents.js
 *
 * Purpose:
 * Displays Youth Events.
 * ============================================================
 */

import {
  getYouthEvents
} from './youthStore.js'


export async function renderYouthEvents(
  container
) {

  const events =
    (await getYouthEvents())
      .filter(
        event =>
          event.active !== false
      )


  if (!events.length) {

    container.innerHTML = `
      <section class="youth-events">
        <h2>Youth Events</h2>
        <p>No youth events have been created yet.</p>
      </section>
    `

    return
  }


  container.innerHTML = `
    <section class="youth-events">
      <header class="page-header">
        <h2>Youth Events</h2>
      </header>

      ${
        events
          .map(
            createEventMarkup
          )
          .join('')
      }
    </section>
  `
}


function createEventMarkup(
  event
) {

  return `
    <article class="event-card dashboard-card" data-youth-event-card>
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
      <p><strong>Type:</strong> ${escapeHtml(event.type)}</p>
      <p><strong>Date:</strong> ${escapeHtml(event.date)}</p>
      <p><strong>Time:</strong> ${escapeHtml(event.time)}</p>
      <p><strong>Location:</strong> ${escapeHtml(event.location)}</p>

      ${
        event.speaker
          ? `<p><strong>Speaker:</strong> ${escapeHtml(event.speaker)}</p>`
          : ''
      }

      ${
        event.description
          ? `<p>${escapeHtml(event.description)}</p>`
          : ''
      }

      <div class="event-actions">
        <button type="button" data-youth-detail>
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
