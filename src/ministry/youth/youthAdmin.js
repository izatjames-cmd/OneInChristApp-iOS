import {
  canDeleteYouth
} from './youthPermissions.js'

import {
  getYouthEvents,
  getYouthAnnouncements,
  createYouthEvent,
  updateYouthEvent,
  archiveYouthEvent,
  deleteYouthEvent,
  createYouthAnnouncement,
  updateYouthAnnouncement,
  deleteYouthAnnouncement
} from './youthStore.js'


let editingEventId =
  null

let editingAnnouncementId =
  null


export async function renderYouthAdmin({
  container,
  user,
  member,
  adminAccess,
  onRefresh
}) {

  const events =
    await getYouthEvents()

  const announcements =
    await getYouthAnnouncements()

  container.innerHTML = `
    <section class="youth-admin">
      <h2>Youth Admin</h2>

      ${createEventFormMarkup()}
      ${createAnnouncementFormMarkup()}

      <h3>Existing Events</h3>
      ${
        events.length
          ? events.map(
              event => createEventAdminMarkup(
                event,
                member,
                adminAccess
              )
            ).join('')
          : '<p>No youth events have been created yet.</p>'
      }

      <h3>Existing Announcements</h3>
      ${
        announcements.length
          ? announcements.map(
              announcement => createAnnouncementAdminMarkup(
                announcement,
                member,
                adminAccess
              )
            ).join('')
          : '<p>No announcements have been created yet.</p>'
      }
    </section>
  `


  bindEventAdmin({
    container,
    events,
    user,
    onRefresh
  })

  bindAnnouncementAdmin({
    container,
    announcements,
    user,
    onRefresh
  })
}


function createEventFormMarkup() {

  return `
    <section class="dashboard-card">
      <h3>Youth Event</h3>

      <form id="youth-event-form">
        <input id="youth-event-title" placeholder="Title" required>
        <textarea id="youth-event-description" rows="3" placeholder="Description"></textarea>
        <input id="youth-event-speaker" placeholder="Speaker">
        <input id="youth-event-date" type="date" required>
        <input id="youth-event-time" type="time">
        <input id="youth-event-location" placeholder="Location">
        <input id="youth-event-image" type="url" placeholder="Image URL">

        <select id="youth-event-type">
          <option value="Weekly Youth Meeting">Weekly Youth Meeting</option>
          <option value="Bible Study">Bible Study</option>
          <option value="Prayer Meeting">Prayer Meeting</option>
          <option value="Fellowship">Fellowship</option>
          <option value="Youth Club">Youth Club</option>
        </select>

        <label>
          <input id="youth-event-active" type="checkbox" checked>
          Published
        </label>

        <button type="submit" id="save-youth-event-button">
          Save Event
        </button>

        <button type="button" id="cancel-youth-event-button" style="display:none;">
          Cancel Edit
        </button>
      </form>

      <div id="youth-event-status" style="min-height:18px; margin-top:8px;"></div>
    </section>
  `
}


function createAnnouncementFormMarkup() {

  return `
    <section class="dashboard-card">
      <h3>Youth Announcement</h3>

      <form id="youth-announcement-form">
        <input id="youth-announcement-title" placeholder="Title" required>
        <textarea id="youth-announcement-message" rows="4" placeholder="Announcement" required></textarea>

        <label>
          <input id="youth-announcement-pinned" type="checkbox">
          Pin announcement
        </label>

        <label>
          <input id="youth-announcement-active" type="checkbox" checked>
          Published
        </label>

        <button type="submit" id="save-youth-announcement-button">
          Save Announcement
        </button>

        <button type="button" id="cancel-youth-announcement-button" style="display:none;">
          Cancel Edit
        </button>
      </form>

      <div id="youth-announcement-status" style="min-height:18px; margin-top:8px;"></div>
    </section>
  `
}


function createEventAdminMarkup(
  event,
  member,
  adminAccess
) {

  return `
    <article class="dashboard-card">
      <h4>${escapeHtml(event.title || 'Youth Event')}</h4>
      <p>${escapeHtml(event.date || '')} ${escapeHtml(event.time || '')}</p>
      <p>${escapeHtml(event.location || '')}</p>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
        <button type="button" data-edit-event="${escapeAttribute(event.id)}">
          Edit
        </button>
        <button type="button" data-archive-event="${escapeAttribute(event.id)}">
          Archive
        </button>
        ${
          canDeleteYouth(member, adminAccess)
            ? `
              <button type="button" data-delete-event="${escapeAttribute(event.id)}">
                Delete
              </button>
            `
            : ''
        }
      </div>
    </article>
  `
}


function createAnnouncementAdminMarkup(
  announcement,
  member,
  adminAccess
) {

  return `
    <article class="dashboard-card">
      <h4>${escapeHtml(announcement.title || 'Announcement')}</h4>
      <p>${escapeHtml(announcement.message || '')}</p>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <button type="button" data-edit-announcement="${escapeAttribute(announcement.id)}">
          Edit
        </button>
        ${
          canDeleteYouth(member, adminAccess)
            ? `
              <button type="button" data-delete-announcement="${escapeAttribute(announcement.id)}">
                Delete
              </button>
            `
            : ''
        }
      </div>
    </article>
  `
}


function bindEventAdmin({
  container,
  events,
  user,
  onRefresh
}) {

  container
    .querySelector(
      '#youth-event-form'
    )
    ?.addEventListener(
      'submit',
      event => saveEventForm(
        event,
        user,
        onRefresh
      )
    )

  container
    .querySelector(
      '#cancel-youth-event-button'
    )
    ?.addEventListener(
      'click',
      clearEventForm
    )

  events.forEach(
    item => bindEventButtons(
      container,
      item,
      onRefresh
    )
  )
}


function bindEventButtons(
  container,
  item,
  onRefresh
) {

  container
    .querySelector(
      `[data-edit-event="${item.id}"]`
    )
    ?.addEventListener(
      'click',
      () => fillEventForm(item)
    )

  container
    .querySelector(
      `[data-archive-event="${item.id}"]`
    )
    ?.addEventListener(
      'click',
      async () => {
        await archiveYouthEvent(item.id)
        await onRefresh()
      }
    )

  container
    .querySelector(
      `[data-delete-event="${item.id}"]`
    )
    ?.addEventListener(
      'click',
      async () => {
        if (window.confirm('Delete this youth event?')) {
          await deleteYouthEvent(item.id)
          await onRefresh()
        }
      }
    )
}


async function saveEventForm(
  event,
  user,
  onRefresh
) {

  event.preventDefault()

  const data = {
    title:
      value('youth-event-title'),
    description:
      value('youth-event-description'),
    speaker:
      value('youth-event-speaker'),
    date:
      value('youth-event-date'),
    time:
      value('youth-event-time'),
    location:
      value('youth-event-location'),
    image:
      value('youth-event-image'),
    type:
      value('youth-event-type'),
    active:
      checked('youth-event-active'),
    archived:
      false,
    updatedBy:
      user.uid
  }

  if (editingEventId) {
    await updateYouthEvent(editingEventId, data)
  } else {
    await createYouthEvent({
      ...data,
      createdBy:
        user.uid
    })
  }

  editingEventId =
    null

  await onRefresh()
}


function fillEventForm(
  item
) {

  editingEventId =
    item.id

  setValue('youth-event-title', item.title)
  setValue('youth-event-description', item.description)
  setValue('youth-event-speaker', item.speaker)
  setValue('youth-event-date', item.date)
  setValue('youth-event-time', item.time)
  setValue('youth-event-location', item.location)
  setValue('youth-event-image', item.image)
  setValue('youth-event-type', item.type)
  setChecked('youth-event-active', item.active !== false)

  document.querySelector('#cancel-youth-event-button').style.display =
    'inline-block'
}


function clearEventForm() {

  editingEventId =
    null

  document.querySelector('#youth-event-form')?.reset()
  document.querySelector('#cancel-youth-event-button').style.display =
    'none'
}


function bindAnnouncementAdmin({
  container,
  announcements,
  user,
  onRefresh
}) {

  container
    .querySelector(
      '#youth-announcement-form'
    )
    ?.addEventListener(
      'submit',
      event => saveAnnouncementForm(event, user, onRefresh)
    )

  container
    .querySelector(
      '#cancel-youth-announcement-button'
    )
    ?.addEventListener(
      'click',
      clearAnnouncementForm
    )

  announcements.forEach(
    item => bindAnnouncementButtons(
      container,
      item,
      onRefresh
    )
  )
}


function bindAnnouncementButtons(
  container,
  item,
  onRefresh
) {

  container
    .querySelector(
      `[data-edit-announcement="${item.id}"]`
    )
    ?.addEventListener(
      'click',
      () => fillAnnouncementForm(item)
    )

  container
    .querySelector(
      `[data-delete-announcement="${item.id}"]`
    )
    ?.addEventListener(
      'click',
      async () => {
        if (window.confirm('Delete this youth announcement?')) {
          await deleteYouthAnnouncement(item.id)
          await onRefresh()
        }
      }
    )
}


async function saveAnnouncementForm(
  event,
  user,
  onRefresh
) {

  event.preventDefault()

  const data = {
    title:
      value('youth-announcement-title'),
    message:
      value('youth-announcement-message'),
    pinned:
      checked('youth-announcement-pinned'),
    active:
      checked('youth-announcement-active'),
    updatedBy:
      user.uid
  }

  if (editingAnnouncementId) {
    await updateYouthAnnouncement(editingAnnouncementId, data)
  } else {
    await createYouthAnnouncement({
      ...data,
      createdBy:
        user.uid
    })
  }

  editingAnnouncementId =
    null

  await onRefresh()
}


function fillAnnouncementForm(
  item
) {

  editingAnnouncementId =
    item.id

  setValue('youth-announcement-title', item.title)
  setValue('youth-announcement-message', item.message)
  setChecked('youth-announcement-pinned', item.pinned === true)
  setChecked('youth-announcement-active', item.active !== false)

  document.querySelector('#cancel-youth-announcement-button').style.display =
    'inline-block'
}


function clearAnnouncementForm() {

  editingAnnouncementId =
    null

  document.querySelector('#youth-announcement-form')?.reset()
  document.querySelector('#cancel-youth-announcement-button').style.display =
    'none'
}


function value(id) {
  return String(document.getElementById(id)?.value || '').trim()
}


function checked(id) {
  return document.getElementById(id)?.checked === true
}


function setValue(id, newValue) {
  const element = document.getElementById(id)
  if (element) element.value = newValue || ''
}


function setChecked(id, newValue) {
  const element = document.getElementById(id)
  if (element) element.checked = newValue === true
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
