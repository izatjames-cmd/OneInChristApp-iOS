/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerSettings.js
 *
 * Purpose:
 * Provides Prayer admin controls.
 * ============================================================
 */

import {
  PRAYER_CATEGORIES
} from './prayerRequests.js'

import {
  canDeletePrayer
} from './prayerPermissions.js'

import {
  notifyPrayerMeetingCreated,
  notifyPrayerAnnouncementCreated
} from './prayerNotifications.js'

import {
  getPrayerRequests,
  getPrayerMeetings,
  getPrayerAnnouncements,
  getPrayerResources,
  updatePrayerRequest,
  deletePrayerRequest,
  createPrayerMeeting,
  updatePrayerMeeting,
  deletePrayerMeeting,
  createPrayerAnnouncement,
  updatePrayerAnnouncement,
  deletePrayerAnnouncement,
  createPrayerResource,
  updatePrayerResource,
  deletePrayerResource
} from './prayerStore.js'


let editingMeetingId = null
let editingAnnouncementId = null
let editingResourceId = null
let editingRequestId = null


export async function renderPrayerSettings({
  container,
  user,
  member,
  adminAccess,
  onRefresh
}) {

  const requests =
    await getPrayerRequests()

  const meetings =
    await getPrayerMeetings()

  const announcements =
    await getPrayerAnnouncements()

  const resources =
    await getPrayerResources()


  container.innerHTML = `
    <section class="prayer-admin">
      <header class="prayer-page-header">
        <h2>Prayer Admin</h2>
        <p>Manage requests, meetings, announcements, and resources for the Prayer ministry.</p>
      </header>

      <section class="prayer-admin-panel">
        <header class="prayer-panel-header">
          <h3>Create / Edit</h3>
          <p>Use these forms to publish Prayer ministry content.</p>
        </header>

        <div class="prayer-admin-grid">
          ${createMeetingFormMarkup()}
          ${createAnnouncementFormMarkup()}
          ${createResourceFormMarkup()}
        </div>
      </section>

      <section class="prayer-admin-panel">
        <header class="prayer-panel-header">
          <h3>Prayer Requests</h3>
          <p>Approve public requests, keep private requests for admins, or mark answered prayers.</p>
        </header>

        ${createRequestEditFormMarkup()}

        <div class="prayer-list">
          ${requests.length ? requests.map(createRequestMarkup).join('') : '<p>No prayer requests.</p>'}
        </div>
      </section>

      <section class="prayer-admin-panel">
        <header class="prayer-panel-header">
          <h3>Prayer Meetings</h3>
          <p>Meetings shown to members with response buttons.</p>
        </header>

        <div class="prayer-list">
          ${meetings.length ? meetings.map(item => createMeetingAdminMarkup(item, member, adminAccess)).join('') : '<p>No prayer meetings.</p>'}
        </div>
      </section>

      <section class="prayer-admin-panel">
        <header class="prayer-panel-header">
          <h3>Prayer Announcements</h3>
          <p>Short updates for the Prayer ministry.</p>
        </header>

        <div class="prayer-list">
          ${announcements.length ? announcements.map(item => createAnnouncementAdminMarkup(item, member, adminAccess)).join('') : '<p>No prayer announcements.</p>'}
        </div>
      </section>

      <section class="prayer-admin-panel">
        <header class="prayer-panel-header">
          <h3>Prayer Resources</h3>
          <p>Links, PDFs, videos, and prayer guides for members.</p>
        </header>

        <div class="prayer-list">
          ${resources.length ? resources.map(item => createResourceAdminMarkup(item, member, adminAccess)).join('') : '<p>No prayer resources.</p>'}
        </div>
      </section>
    </section>
  `


  bindPrayerRequestAdmin({
    container,
    requests,
    onRefresh
  })

  bindPrayerMeetingAdmin({
    container,
    meetings,
    user,
    onRefresh
  })

  bindPrayerAnnouncementAdmin({
    container,
    announcements,
    user,
    onRefresh
  })

  bindPrayerResourceAdmin({
    container,
    resources,
    user,
    onRefresh
  })
}


function createMeetingFormMarkup() {

  return `
    <section class="dashboard-card prayer-form-card">
      <h3>Prayer Meeting</h3>
      <form id="prayer-meeting-form">
        <input id="prayer-meeting-title" placeholder="Title" required>
        <textarea id="prayer-meeting-description" rows="3" placeholder="Description"></textarea>
        <input id="prayer-meeting-leader" placeholder="Leader">
        <input id="prayer-meeting-date" type="date" required>
        <input id="prayer-meeting-time" type="time">
        <input id="prayer-meeting-location" placeholder="Location">
        <input id="prayer-meeting-online-link" type="url" placeholder="Online meeting link">
        <textarea id="prayer-meeting-notes" rows="3" placeholder="Notes"></textarea>
        <label><input id="prayer-meeting-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Meeting</button>
        <button type="button" id="cancel-prayer-meeting-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createAnnouncementFormMarkup() {

  return `
    <section class="dashboard-card prayer-form-card">
      <h3>Prayer Announcement</h3>
      <form id="prayer-announcement-form">
        <input id="prayer-announcement-title" placeholder="Title" required>
        <textarea id="prayer-announcement-message" rows="4" placeholder="Announcement" required></textarea>
        <label><input id="prayer-announcement-pinned" type="checkbox"> Pin announcement</label>
        <label><input id="prayer-announcement-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Announcement</button>
        <button type="button" id="cancel-prayer-announcement-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createResourceFormMarkup() {

  return `
    <section class="dashboard-card prayer-form-card">
      <h3>Prayer Resource</h3>
      <form id="prayer-resource-form">
        <input id="prayer-resource-title" placeholder="Title" required>
        <textarea id="prayer-resource-description" rows="3" placeholder="Description"></textarea>
        <select id="prayer-resource-type">
          <option>Bible study material</option>
          <option>Prayer guide</option>
          <option>PDF file</option>
          <option>External website</option>
          <option>Video</option>
        </select>
        <input id="prayer-resource-link" type="url" placeholder="Resource link">
        <label><input id="prayer-resource-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Resource</button>
        <button type="button" id="cancel-prayer-resource-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createRequestEditFormMarkup() {

  return `
    <section class="dashboard-card prayer-form-card" id="prayer-request-edit-card" style="display:none;">
      <h3>Edit Prayer Request</h3>
      <form id="prayer-request-admin-form">
        <input id="prayer-request-admin-name" placeholder="Name">
        <label><input id="prayer-request-admin-anonymous" type="checkbox"> Anonymous</label>
        <select id="prayer-request-admin-category">
          ${PRAYER_CATEGORIES.map(category => `<option>${escapeHtml(category)}</option>`).join('')}
        </select>
        <textarea id="prayer-request-admin-request" rows="4" placeholder="Prayer request" required></textarea>
        <select id="prayer-request-admin-visibility">
          <option value="church">Church-wide request</option>
          <option value="private">Private request</option>
        </select>
        <select id="prayer-request-admin-status">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <label><input id="prayer-request-admin-answered" type="checkbox"> Mark as answered</label>
        <button type="submit">Save Prayer Request</button>
        <button type="button" id="cancel-prayer-request-button">Cancel Edit</button>
      </form>
    </section>
  `
}


function createRequestMarkup(request) {

  return `
    <article class="dashboard-card prayer-admin-item">
      <h4>${escapeHtml(request.category || 'Prayer Request')}</h4>
      <p>${escapeHtml(request.request)}</p>
      <p><strong>Status:</strong> ${escapeHtml(request.status || 'pending')}</p>
      <p><strong>Visibility:</strong> ${escapeHtml(request.visibility || '')}</p>
      <p><strong>By:</strong> ${escapeHtml(request.anonymous ? 'Anonymous' : request.name)}</p>
      <div class="prayer-action-grid">
        <button type="button" data-request-action="edit" data-request-id="${escapeAttribute(request.id)}">Edit</button>
        <button type="button" data-request-action="approve" data-request-id="${escapeAttribute(request.id)}">Approve</button>
        <button type="button" data-request-action="reject" data-request-id="${escapeAttribute(request.id)}">Reject</button>
        <button type="button" data-request-action="answered" data-request-id="${escapeAttribute(request.id)}">Answered</button>
        <button type="button" data-request-action="archive" data-request-id="${escapeAttribute(request.id)}">Archive</button>
        <button type="button" data-request-action="delete" data-request-id="${escapeAttribute(request.id)}">Delete</button>
      </div>
    </article>
  `
}


function createMeetingAdminMarkup(item, member, adminAccess) {

  return createItemAdminMarkup(
    item,
    'meeting',
    canDeletePrayer(member, adminAccess)
  )
}


function createAnnouncementAdminMarkup(item, member, adminAccess) {

  return createItemAdminMarkup(
    item,
    'announcement',
    canDeletePrayer(member, adminAccess)
  )
}


function createResourceAdminMarkup(item, member, adminAccess) {

  return createItemAdminMarkup(
    item,
    'resource',
    canDeletePrayer(member, adminAccess)
  )
}


function createItemAdminMarkup(item, type, canDelete) {

  return `
    <article class="dashboard-card prayer-admin-item">
      <h4>${escapeHtml(item.title || type)}</h4>
      <p>${escapeHtml(item.date || item.message || item.description || '')}</p>
      <div class="prayer-action-grid">
        <button type="button" data-edit-${type}="${escapeAttribute(item.id)}">Edit</button>
        <button type="button" data-archive-${type}="${escapeAttribute(item.id)}">Archive</button>
        ${canDelete ? `<button type="button" data-delete-${type}="${escapeAttribute(item.id)}">Delete</button>` : ''}
      </div>
    </article>
  `
}


function bindPrayerRequestAdmin({ container, requests, onRefresh }) {

  container.querySelector('#prayer-request-admin-form')?.addEventListener(
    'submit',
    async event => {
      event.preventDefault()
      if (!editingRequestId) return
      await updatePrayerRequest(editingRequestId, getRequestAdminData())
      clearRequestForm()
      await onRefresh()
    }
  )

  container.querySelector('#cancel-prayer-request-button')?.addEventListener('click', clearRequestForm)

  container
    .querySelectorAll('[data-request-action]')
    .forEach(
      button => button.addEventListener(
        'click',
        async () => {
          const id = button.dataset.requestId
          const action = button.dataset.requestAction
          const request = requests.find(item => item.id === id)
          if (!request) return
          if (action === 'edit') {
            fillRequestForm(request)
            return
          }
          if (action === 'delete' && !window.confirm('Delete this prayer request?')) return
          if (action === 'delete') await deletePrayerRequest(id)
          else await updatePrayerRequest(id, requestActionData(action))
          await onRefresh()
        }
      )
    )
}


function getRequestAdminData() {

  return {
    name: value('prayer-request-admin-name'),
    anonymous: checked('prayer-request-admin-anonymous'),
    category: value('prayer-request-admin-category'),
    request: value('prayer-request-admin-request'),
    visibility: value('prayer-request-admin-visibility'),
    status: value('prayer-request-admin-status'),
    answered: checked('prayer-request-admin-answered')
  }
}


function requestActionData(action) {

  if (action === 'approve') return { status: 'approved' }
  if (action === 'reject') return { status: 'rejected' }
  if (action === 'answered') return { answered: true, status: 'approved' }
  if (action === 'archive') return { archived: true }
  return {}
}


function bindPrayerMeetingAdmin({ container, meetings, user, onRefresh }) {

  bindForm({
    container,
    formId: 'prayer-meeting-form',
    cancelId: 'cancel-prayer-meeting-button',
    items: meetings,
    type: 'meeting',
    getData: getMeetingData,
    getEditingId: () => editingMeetingId,
    setEditingId: value => { editingMeetingId = value },
    createItem: async data => {
      const meetingId =
        await createPrayerMeeting({ ...data, createdBy: user.uid })

      await notifyPrayerMeetingCreated({
        uid:
          user.uid,
        meetingId,
        title:
          data.title,
        date:
          data.date,
        time:
          data.time
      })

      return meetingId
    },
    updateItem: updatePrayerMeeting,
    deleteItem: deletePrayerMeeting,
    fillForm: fillMeetingForm,
    clearForm: clearMeetingForm,
    onRefresh
  })
}


function bindPrayerAnnouncementAdmin({ container, announcements, user, onRefresh }) {

  bindForm({
    container,
    formId: 'prayer-announcement-form',
    cancelId: 'cancel-prayer-announcement-button',
    items: announcements,
    type: 'announcement',
    getData: getAnnouncementData,
    getEditingId: () => editingAnnouncementId,
    setEditingId: value => { editingAnnouncementId = value },
    createItem: async data => {
      const announcementId =
        await createPrayerAnnouncement({ ...data, createdBy: user.uid })

      await notifyPrayerAnnouncementCreated({
        uid:
          user.uid,
        announcementId,
        title:
          data.title,
        message:
          data.message
      })

      return announcementId
    },
    updateItem: updatePrayerAnnouncement,
    deleteItem: deletePrayerAnnouncement,
    fillForm: fillAnnouncementForm,
    clearForm: clearAnnouncementForm,
    onRefresh
  })
}


function bindPrayerResourceAdmin({ container, resources, user, onRefresh }) {

  bindForm({
    container,
    formId: 'prayer-resource-form',
    cancelId: 'cancel-prayer-resource-button',
    items: resources,
    type: 'resource',
    getData: getResourceData,
    getEditingId: () => editingResourceId,
    setEditingId: value => { editingResourceId = value },
    createItem: data => createPrayerResource({ ...data, createdBy: user.uid }),
    updateItem: updatePrayerResource,
    deleteItem: deletePrayerResource,
    fillForm: fillResourceForm,
    clearForm: clearResourceForm,
    onRefresh
  })
}


function bindForm(config) {

  config.container.querySelector(`#${config.formId}`)?.addEventListener(
    'submit',
    async event => {
      event.preventDefault()
      const data = config.getData()
      const editingId = config.getEditingId()
      if (editingId) await config.updateItem(editingId, data)
      else await config.createItem(data)
      config.setEditingId(null)
      await config.onRefresh()
    }
  )

  config.container.querySelector(`#${config.cancelId}`)?.addEventListener('click', config.clearForm)

  config.items.forEach(item => bindItemButtons(config, item))
}


function bindItemButtons(config, item) {

  config.container.querySelector(`[data-edit-${config.type}="${item.id}"]`)?.addEventListener('click', () => config.fillForm(item))
  config.container.querySelector(`[data-archive-${config.type}="${item.id}"]`)?.addEventListener('click', async () => {
    await config.updateItem(item.id, { archived: true })
    await config.onRefresh()
  })
  config.container.querySelector(`[data-delete-${config.type}="${item.id}"]`)?.addEventListener('click', async () => {
    if (window.confirm(`Delete this prayer ${config.type}?`)) {
      await config.deleteItem(item.id)
      await config.onRefresh()
    }
  })
}


function getMeetingData() {

  return {
    title: value('prayer-meeting-title'),
    description: value('prayer-meeting-description'),
    leader: value('prayer-meeting-leader'),
    date: value('prayer-meeting-date'),
    time: value('prayer-meeting-time'),
    location: value('prayer-meeting-location'),
    onlineLink: value('prayer-meeting-online-link'),
    notes: value('prayer-meeting-notes'),
    active: checked('prayer-meeting-active'),
    archived: false
  }
}


function getAnnouncementData() {

  return {
    title: value('prayer-announcement-title'),
    message: value('prayer-announcement-message'),
    pinned: checked('prayer-announcement-pinned'),
    active: checked('prayer-announcement-active'),
    archived: false
  }
}


function getResourceData() {

  return {
    title: value('prayer-resource-title'),
    description: value('prayer-resource-description'),
    type: value('prayer-resource-type'),
    link: value('prayer-resource-link'),
    active: checked('prayer-resource-active'),
    archived: false
  }
}


function fillMeetingForm(item) {
  editingMeetingId = item.id
  setValue('prayer-meeting-title', item.title)
  setValue('prayer-meeting-description', item.description)
  setValue('prayer-meeting-leader', item.leader)
  setValue('prayer-meeting-date', item.date)
  setValue('prayer-meeting-time', item.time)
  setValue('prayer-meeting-location', item.location)
  setValue('prayer-meeting-online-link', item.onlineLink)
  setValue('prayer-meeting-notes', item.notes)
  setChecked('prayer-meeting-active', item.active !== false)
  showCancel('cancel-prayer-meeting-button')
}


function fillAnnouncementForm(item) {
  editingAnnouncementId = item.id
  setValue('prayer-announcement-title', item.title)
  setValue('prayer-announcement-message', item.message)
  setChecked('prayer-announcement-pinned', item.pinned === true)
  setChecked('prayer-announcement-active', item.active !== false)
  showCancel('cancel-prayer-announcement-button')
}


function fillResourceForm(item) {
  editingResourceId = item.id
  setValue('prayer-resource-title', item.title)
  setValue('prayer-resource-description', item.description)
  setValue('prayer-resource-type', item.type)
  setValue('prayer-resource-link', item.link)
  setChecked('prayer-resource-active', item.active !== false)
  showCancel('cancel-prayer-resource-button')
}


function fillRequestForm(item) {
  editingRequestId = item.id
  setValue('prayer-request-admin-name', item.name)
  setChecked('prayer-request-admin-anonymous', item.anonymous === true)
  setValue('prayer-request-admin-category', item.category || 'Other')
  setValue('prayer-request-admin-request', item.request)
  setValue('prayer-request-admin-visibility', item.visibility || 'church')
  setValue('prayer-request-admin-status', item.status || 'pending')
  setChecked('prayer-request-admin-answered', item.answered === true)
  showCard('prayer-request-edit-card')
}


function clearMeetingForm() { editingMeetingId = null; reset('prayer-meeting-form', 'cancel-prayer-meeting-button') }
function clearAnnouncementForm() { editingAnnouncementId = null; reset('prayer-announcement-form', 'cancel-prayer-announcement-button') }
function clearResourceForm() { editingResourceId = null; reset('prayer-resource-form', 'cancel-prayer-resource-button') }
function clearRequestForm() { editingRequestId = null; hideCard('prayer-request-edit-card'); document.getElementById('prayer-request-admin-form')?.reset() }
function value(id) { return String(document.getElementById(id)?.value || '').trim() }
function checked(id) { return document.getElementById(id)?.checked === true }
function setValue(id, newValue) { const el = document.getElementById(id); if (el) el.value = newValue || '' }
function setChecked(id, newValue) { const el = document.getElementById(id); if (el) el.checked = newValue === true }
function showCancel(id) { const el = document.getElementById(id); if (el) el.style.display = 'inline-block' }
function showCard(id) { const el = document.getElementById(id); if (el) el.style.display = 'block' }
function hideCard(id) { const el = document.getElementById(id); if (el) el.style.display = 'none' }
function reset(formId, cancelId) { document.getElementById(formId)?.reset(); const el = document.getElementById(cancelId); if (el) el.style.display = 'none' }
function escapeAttribute(input) { return escapeHtml(input) }
function escapeHtml(input) { return String(input || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;') }
