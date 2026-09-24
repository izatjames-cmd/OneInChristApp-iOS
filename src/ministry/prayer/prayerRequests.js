/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerRequests.js
 *
 * Purpose:
 * Displays and submits prayer requests.
 * ============================================================
 */

import {
  createPrayerRequest,
  getMemberPrayerRequests
} from './prayerStore.js'


export const PRAYER_CATEGORIES = [
  'Health',
  'Family',
  'Marriage',
  'Children',
  'Work',
  'Finances',
  'Thanksgiving',
  'Spiritual Growth',
  'Mission',
  'Other'
]


export async function renderPrayerRequests({
  container,
  user,
  member,
  onRefresh
}) {

  const requests =
    await getMemberPrayerRequests()


  container.innerHTML = `
    <section class="prayer-requests">
      <header class="page-header">
        <h2>Prayer Requests</h2>
      </header>

      <section class="dashboard-card">
        <h3>Submit Prayer Request</h3>

        <form id="prayer-request-form">
          <input id="prayer-request-name" placeholder="Name" value="${escapeAttribute(member?.name || '')}">

          <label>
            <input id="prayer-request-anonymous" type="checkbox">
            Submit anonymously
          </label>

          <select id="prayer-request-category">
            ${PRAYER_CATEGORIES.map(
              category =>
                `<option value="${escapeAttribute(category)}">${escapeHtml(category)}</option>`
            ).join('')}
          </select>

          <textarea id="prayer-request-text" rows="5" placeholder="Prayer request" required></textarea>

          <label>
            <input id="prayer-request-private" type="checkbox">
            Private prayer request
          </label>

          <label>
            <input id="prayer-request-church" type="checkbox" checked>
            Church-wide prayer request
          </label>

          <button type="submit">
            Submit Request
          </button>
        </form>

        <div id="prayer-request-status" style="min-height:18px; margin-top:8px;"></div>
      </section>

      <section class="dashboard-card">
        <h3>Church-wide Prayer Requests</h3>
        ${
          requests.length
            ? requests.map(createPrayerRequestMarkup).join('')
            : '<p>No approved church-wide prayer requests.</p>'
        }
      </section>
    </section>
  `


  container
    .querySelector('#prayer-request-form')
    ?.addEventListener(
      'submit',
      event => savePrayerRequest(
        event,
        user,
        onRefresh
      )
    )
}


function createPrayerRequestMarkup(
  request
) {

  return `
    <article class="dashboard-card">
      <h4>${escapeHtml(request.category || 'Prayer Request')}</h4>
      <p>${escapeHtml(request.request)}</p>
      <p><strong>By:</strong> ${escapeHtml(
        request.anonymous ? 'Anonymous' : request.name
      )}</p>
      ${
        request.answered
          ? '<p><strong>Status:</strong> Answered</p>'
          : ''
      }
    </article>
  `
}


async function savePrayerRequest(
  event,
  user,
  onRefresh
) {

  event.preventDefault()

  const status =
    document.getElementById(
      'prayer-request-status'
    )


  try {

    await createPrayerRequest({
      name:
        value('prayer-request-name'),
      anonymous:
        checked('prayer-request-anonymous'),
      category:
        value('prayer-request-category'),
      request:
        value('prayer-request-text'),
      visibility:
        checked('prayer-request-private')
          ? 'private'
          : 'church',
      churchWide:
        checked('prayer-request-church'),
      private:
        checked('prayer-request-private'),
      createdBy:
        user?.uid || '',
      createdByName:
        value('prayer-request-name')
    })

    status.textContent =
      'Prayer request submitted for approval.'

    await onRefresh()

  } catch (error) {

    console.error(
      'Unable to submit prayer request:',
      error
    )

    status.textContent =
      'Unable to submit prayer request.'
  }
}


function value(id) {
  return String(document.getElementById(id)?.value || '').trim()
}


function checked(id) {
  return document.getElementById(id)?.checked === true
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
