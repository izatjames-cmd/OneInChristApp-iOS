/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolSettings.js
 *
 * Purpose:
 * Provides Sunday School admin controls.
 * ============================================================
 */

import {
  getSundaySchoolClasses,
  createSundaySchoolClass,
  updateSundaySchoolClass,
  deleteSundaySchoolClass,
  getSundaySchoolAnnouncements,
  createSundaySchoolAnnouncement,
  updateSundaySchoolAnnouncement,
  deleteSundaySchoolAnnouncement,
  getSundaySchoolResources,
  createSundaySchoolResource,
  updateSundaySchoolResource,
  deleteSundaySchoolResource,
  getSundaySchoolGallery,
  createSundaySchoolGalleryPhoto,
  updateSundaySchoolGalleryPhoto,
  deleteSundaySchoolGalleryPhoto,
  getSundaySchoolTeachers,
  createSundaySchoolTeacher,
  updateSundaySchoolTeacher,
  deleteSundaySchoolTeacher
} from './sundaySchoolStore.js'

import {
  notifySundaySchoolClassCreated,
  notifySundaySchoolAnnouncementCreated,
  notifySundaySchoolResourceCreated
  ,notifySundaySchoolGalleryPublished
} from './sundaySchoolNotifications.js'

import {
  chooseAndUploadSundaySchoolMedia,
  deleteSundaySchoolGalleryMedia,
  sundaySchoolGalleryMediaData
} from './sundaySchoolImageStore.js'


let editingClassId = null
let editingAnnouncementId = null
let editingResourceId = null
let editingPhotoId = null
let editingTeacherId = null


export async function renderSundaySchoolSettings({
  container,
  user,
  onRefresh
}) {
  const classes = await getSundaySchoolClasses()
  const announcements = await getSundaySchoolAnnouncements()
  const resources = await getSundaySchoolResources()
  const photos = await getSundaySchoolGallery()
  const teachers = await getSundaySchoolTeachers()

  container.innerHTML = `
    <section class="sunday-school-admin">
      <header class="sunday-school-page-header">
        <h2>Sunday School Admin</h2>
        <p>Manage classes, announcements, resources, gallery photos and videos, and teachers.</p>
      </header>

      <section class="sunday-school-admin-panel">
        <header class="sunday-school-panel-header">
          <h3>Create / Edit</h3>
        </header>
        <div class="sunday-school-admin-grid">
          ${createClassFormMarkup()}
          ${createAnnouncementFormMarkup()}
          ${createResourceFormMarkup()}
          ${createPhotoFormMarkup()}
          ${createTeacherFormMarkup()}
        </div>
      </section>

      ${createListPanel('Sunday School Classes', classes, item => createItemMarkup(item, 'class'))}
      ${createListPanel('Announcements', announcements, item => createItemMarkup(item, 'announcement'))}
      ${createListPanel('Resources', resources, item => createItemMarkup(item, 'resource'))}
      ${createListPanel('Gallery Photos and Videos', photos, item => createItemMarkup(item, 'photo'))}
      ${createListPanel('Teachers', teachers, item => createItemMarkup(item, 'teacher'))}
    </section>
  `

  bindAdminForms({ container, user, onRefresh, classes, announcements, resources, photos, teachers })
}


function createClassFormMarkup() {
  return `
    <section class="dashboard-card sunday-school-form-card">
      <h3>Sunday School Class</h3>
      <form id="sunday-school-class-form">
        <input id="sunday-school-class-title" placeholder="Title" required>
        <textarea id="sunday-school-class-description" rows="3" placeholder="Description"></textarea>
        <input id="sunday-school-class-teacher" placeholder="Teacher">
        <input id="sunday-school-class-assistant" placeholder="Assistant Teacher">
        <input id="sunday-school-class-age" placeholder="Age Group">
        <input id="sunday-school-class-date" type="date" required>
        <input id="sunday-school-class-time" type="time">
        <input id="sunday-school-class-room" placeholder="Room">
        <input id="sunday-school-class-image" type="url" placeholder="Optional image URL">
        <label><input id="sunday-school-class-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Class</button>
        <button type="button" id="cancel-sunday-school-class-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createAnnouncementFormMarkup() {
  return `
    <section class="dashboard-card sunday-school-form-card">
      <h3>Announcement</h3>
      <form id="sunday-school-announcement-form">
        <input id="sunday-school-announcement-title" placeholder="Title" required>
        <textarea id="sunday-school-announcement-message" rows="4" placeholder="Announcement" required></textarea>
        <label><input id="sunday-school-announcement-pinned" type="checkbox"> Pin announcement</label>
        <label><input id="sunday-school-announcement-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Announcement</button>
        <button type="button" id="cancel-sunday-school-announcement-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createResourceFormMarkup() {
  return `
    <section class="dashboard-card sunday-school-form-card">
      <h3>Resource</h3>
      <form id="sunday-school-resource-form">
        <input id="sunday-school-resource-title" placeholder="Title" required>
        <textarea id="sunday-school-resource-description" rows="3" placeholder="Description"></textarea>
        <select id="sunday-school-resource-type">
          <option>Bible lesson</option>
          <option>Lesson plan</option>
          <option>Bible story</option>
          <option>Worksheet</option>
          <option>Colouring page</option>
          <option>PDF document</option>
          <option>Video</option>
          <option>External link</option>
        </select>
        <input id="sunday-school-resource-link" type="url" placeholder="Resource link">
        <label><input id="sunday-school-resource-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Resource</button>
        <button type="button" id="cancel-sunday-school-resource-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createPhotoFormMarkup() {
  return `
    <section class="dashboard-card sunday-school-form-card">
      <h3>Gallery Photo or Video</h3>
      <form id="sunday-school-photo-form">
        <input id="sunday-school-photo-title" placeholder="Title" required>
        <input id="sunday-school-photo-date" type="date" required>
        <select id="sunday-school-photo-album">
          <option>Sunday School</option>
          <option>Easter</option>
          <option>Christmas</option>
          <option>Special Event</option>
          <option>Other</option>
        </select>
        <label>Media type
          <select id="sunday-school-photo-type">
            <option value="image">Photo</option>
            <option value="video">Video</option>
          </select>
        </label>
        <input id="sunday-school-photo-image" type="url" placeholder="Photo or video URL" required>
        <input id="sunday-school-photo-path" type="hidden">
        <input id="sunday-school-photo-mime" type="hidden">
        <input id="sunday-school-photo-size" type="hidden">
        <button type="button" id="upload-sunday-school-photo-button">Upload Photo or Video</button>
        <p>Photos up to 10 MB. Videos up to 100 MB.</p>
        <textarea id="sunday-school-photo-description" rows="3" placeholder="Description"></textarea>
        <label><input id="sunday-school-photo-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Gallery Item</button>
        <button type="button" id="cancel-sunday-school-photo-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createTeacherFormMarkup() {
  return `
    <section class="dashboard-card sunday-school-form-card">
      <h3>Teacher Profile</h3>
      <form id="sunday-school-teacher-form">
        <input id="sunday-school-teacher-name" placeholder="Name" required>
        <input id="sunday-school-teacher-photo" type="url" placeholder="Photo URL">
        <select id="sunday-school-teacher-role">
          <option>Teacher</option>
          <option>Assistant Teacher</option>
        </select>
        <input id="sunday-school-teacher-age" placeholder="Age Group">
        <textarea id="sunday-school-teacher-intro" rows="3" placeholder="Short introduction"></textarea>
        <label><input id="sunday-school-teacher-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Teacher</button>
        <button type="button" id="cancel-sunday-school-teacher-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createListPanel(title, items, createMarkup) {
  return `
    <section class="sunday-school-admin-panel">
      <header class="sunday-school-panel-header">
        <h3>${escapeHtml(title)}</h3>
      </header>
      <div class="sunday-school-list">
        ${items.length ? items.map(createMarkup).join('') : '<p>Nothing has been created yet.</p>'}
      </div>
    </section>
  `
}


function createItemMarkup(item, type) {
  return `
    <article class="dashboard-card sunday-school-admin-item">
      <h4>${escapeHtml(item.title || item.name || type)}</h4>
      <p>${escapeHtml(item.date || item.message || item.description || item.ageGroup || '')}</p>
      <div class="sunday-school-action-grid">
        <button type="button" data-edit-${type}="${escapeAttribute(item.id)}">Edit</button>
        <button type="button" data-archive-${type}="${escapeAttribute(item.id)}">Archive</button>
        <button type="button" data-delete-${type}="${escapeAttribute(item.id)}">Delete</button>
      </div>
    </article>
  `
}


function bindAdminForms(data) {
  bindForm({ ...data, formId: 'sunday-school-class-form', cancelId: 'cancel-sunday-school-class-button', items: data.classes, type: 'class', getData: getClassData, getEditingId: () => editingClassId, setEditingId: value => { editingClassId = value }, createItem: createClassWithNotification, updateItem: updateSundaySchoolClass, deleteItem: deleteSundaySchoolClass, fillForm: fillClassForm, clearForm: clearClassForm })
  bindForm({ ...data, formId: 'sunday-school-announcement-form', cancelId: 'cancel-sunday-school-announcement-button', items: data.announcements, type: 'announcement', getData: getAnnouncementData, getEditingId: () => editingAnnouncementId, setEditingId: value => { editingAnnouncementId = value }, createItem: createAnnouncementWithNotification, updateItem: updateSundaySchoolAnnouncement, deleteItem: deleteSundaySchoolAnnouncement, fillForm: fillAnnouncementForm, clearForm: clearAnnouncementForm })
  bindForm({ ...data, formId: 'sunday-school-resource-form', cancelId: 'cancel-sunday-school-resource-button', items: data.resources, type: 'resource', getData: getResourceData, getEditingId: () => editingResourceId, setEditingId: value => { editingResourceId = value }, createItem: createResourceWithNotification, updateItem: updateSundaySchoolResource, deleteItem: deleteSundaySchoolResource, fillForm: fillResourceForm, clearForm: clearResourceForm })
  bindForm({ ...data, formId: 'sunday-school-photo-form', cancelId: 'cancel-sunday-school-photo-button', items: data.photos, type: 'photo', getData: getPhotoData, getEditingId: () => editingPhotoId, setEditingId: value => { editingPhotoId = value }, createItem: createPhotoWithNotification, updateItem: updateSundaySchoolGalleryPhoto, deleteItem: deleteSundaySchoolGalleryPhoto, fillForm: fillPhotoForm, clearForm: clearPhotoForm })
  bindForm({ ...data, formId: 'sunday-school-teacher-form', cancelId: 'cancel-sunday-school-teacher-button', items: data.teachers, type: 'teacher', getData: getTeacherData, getEditingId: () => editingTeacherId, setEditingId: value => { editingTeacherId = value }, createItem: (data, user) => createSundaySchoolTeacher({ ...data, createdBy: user?.uid }), updateItem: updateSundaySchoolTeacher, deleteItem: deleteSundaySchoolTeacher, fillForm: fillTeacherForm, clearForm: clearTeacherForm })
  bindPhotoUpload(data.container, data.user)
}

async function createPhotoWithNotification(data, user) {
  const id = await createSundaySchoolGalleryPhoto({ ...data, createdBy: user?.uid })
  if (data.active) await notifySundaySchoolGalleryPublished({ uid: user?.uid, title: data.title, date: data.date })
  return id
}


function bindForm(config) {
  config.container.querySelector(`#${config.formId}`)?.addEventListener('submit', async event => {
    event.preventDefault()
    const data = config.getData()
    const editingId = config.getEditingId()
    if (editingId) await config.updateItem(editingId, data)
    else await config.createItem(data, config.user)
    config.setEditingId(null)
    await config.onRefresh()
  })
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
    if (window.confirm('Delete this item?')) {
      await config.deleteItem(item.id)
      await config.onRefresh()
    }
  })
}


async function createClassWithNotification(data, user) {
  const id = await createSundaySchoolClass({ ...data, createdBy: user?.uid })
  await notifySundaySchoolClassCreated({ uid: user?.uid, title: data.title, date: data.date, time: data.time })
  return id
}


async function createAnnouncementWithNotification(data, user) {
  const id = await createSundaySchoolAnnouncement({ ...data, createdBy: user?.uid })
  await notifySundaySchoolAnnouncementCreated({ uid: user?.uid, title: data.title, message: data.message })
  return id
}


async function createResourceWithNotification(data, user) {
  const id = await createSundaySchoolResource({ ...data, createdBy: user?.uid })
  await notifySundaySchoolResourceCreated({ uid: user?.uid, title: data.title })
  return id
}


function getClassData() { return { title: value('sunday-school-class-title'), description: value('sunday-school-class-description'), teacher: value('sunday-school-class-teacher'), assistantTeacher: value('sunday-school-class-assistant'), ageGroup: value('sunday-school-class-age'), date: value('sunday-school-class-date'), time: value('sunday-school-class-time'), room: value('sunday-school-class-room'), image: value('sunday-school-class-image'), active: checked('sunday-school-class-active') } }
function getAnnouncementData() { return { title: value('sunday-school-announcement-title'), message: value('sunday-school-announcement-message'), pinned: checked('sunday-school-announcement-pinned'), active: checked('sunday-school-announcement-active') } }
function getResourceData() { return { title: value('sunday-school-resource-title'), description: value('sunday-school-resource-description'), type: value('sunday-school-resource-type'), link: value('sunday-school-resource-link'), active: checked('sunday-school-resource-active') } }
function getPhotoData() {
  return {
    title: value('sunday-school-photo-title'),
    date: value('sunday-school-photo-date'),
    album: value('sunday-school-photo-album'),
    description: value('sunday-school-photo-description'),
    active: checked('sunday-school-photo-active'),
    ...sundaySchoolGalleryMediaData({
      mediaType: value('sunday-school-photo-type') || 'image',
      url: value('sunday-school-photo-image'),
      path: value('sunday-school-photo-path'),
      mimeType: value('sunday-school-photo-mime'),
      size: Number(value('sunday-school-photo-size')) || 0
    })
  }
}
function getTeacherData() { return { name: value('sunday-school-teacher-name'), photo: value('sunday-school-teacher-photo'), role: value('sunday-school-teacher-role'), ageGroup: value('sunday-school-teacher-age'), introduction: value('sunday-school-teacher-intro'), active: checked('sunday-school-teacher-active') } }
function fillClassForm(item) { editingClassId = item.id; setValue('sunday-school-class-title', item.title); setValue('sunday-school-class-description', item.description); setValue('sunday-school-class-teacher', item.teacher); setValue('sunday-school-class-assistant', item.assistantTeacher); setValue('sunday-school-class-age', item.ageGroup); setValue('sunday-school-class-date', item.date); setValue('sunday-school-class-time', item.time); setValue('sunday-school-class-room', item.room); setValue('sunday-school-class-image', item.image); setChecked('sunday-school-class-active', item.active !== false); showCancel('cancel-sunday-school-class-button') }
function fillAnnouncementForm(item) { editingAnnouncementId = item.id; setValue('sunday-school-announcement-title', item.title); setValue('sunday-school-announcement-message', item.message); setChecked('sunday-school-announcement-pinned', item.pinned === true); setChecked('sunday-school-announcement-active', item.active !== false); showCancel('cancel-sunday-school-announcement-button') }
function fillResourceForm(item) { editingResourceId = item.id; setValue('sunday-school-resource-title', item.title); setValue('sunday-school-resource-description', item.description); setValue('sunday-school-resource-type', item.type); setValue('sunday-school-resource-link', item.link); setChecked('sunday-school-resource-active', item.active !== false); showCancel('cancel-sunday-school-resource-button') }
function fillPhotoForm(item) {
  editingPhotoId = item.id
  const type = item.mediaType === 'video' || item.video ? 'video' : 'image'
  setValue('sunday-school-photo-title', item.title)
  setValue('sunday-school-photo-date', item.date)
  setValue('sunday-school-photo-album', item.album)
  setValue('sunday-school-photo-type', type)
  setValue('sunday-school-photo-image', item.mediaUrl || (type === 'video' ? item.video : item.image))
  setValue('sunday-school-photo-path', item.mediaPath || (type === 'video' ? item.videoPath : item.imagePath))
  setValue('sunday-school-photo-mime', item.mimeType)
  setValue('sunday-school-photo-size', item.mediaSize)
  setValue('sunday-school-photo-description', item.description)
  setChecked('sunday-school-photo-active', item.active !== false)
  showCancel('cancel-sunday-school-photo-button')
}
function fillTeacherForm(item) { editingTeacherId = item.id; setValue('sunday-school-teacher-name', item.name); setValue('sunday-school-teacher-photo', item.photo); setValue('sunday-school-teacher-role', item.role); setValue('sunday-school-teacher-age', item.ageGroup); setValue('sunday-school-teacher-intro', item.introduction); setChecked('sunday-school-teacher-active', item.active !== false); showCancel('cancel-sunday-school-teacher-button') }
function clearClassForm() { editingClassId = null; reset('sunday-school-class-form', 'cancel-sunday-school-class-button') }
function clearAnnouncementForm() { editingAnnouncementId = null; reset('sunday-school-announcement-form', 'cancel-sunday-school-announcement-button') }
function clearResourceForm() { editingResourceId = null; reset('sunday-school-resource-form', 'cancel-sunday-school-resource-button') }
function clearPhotoForm() { editingPhotoId = null; reset('sunday-school-photo-form', 'cancel-sunday-school-photo-button') }
function clearTeacherForm() { editingTeacherId = null; reset('sunday-school-teacher-form', 'cancel-sunday-school-teacher-button') }
function value(id) { return String(document.getElementById(id)?.value || '').trim() }
function checked(id) { return document.getElementById(id)?.checked === true }
function setValue(id, newValue) { const el = document.getElementById(id); if (el) el.value = newValue || '' }
function setChecked(id, newValue) { const el = document.getElementById(id); if (el) el.checked = newValue === true }
function showCancel(id) { const el = document.getElementById(id); if (el) el.style.display = 'inline-block' }
function reset(formId, cancelId) { document.getElementById(formId)?.reset(); const el = document.getElementById(cancelId); if (el) el.style.display = 'none' }
function escapeAttribute(input) { return escapeHtml(input) }
function escapeHtml(input) { return String(input || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;') }


function bindPhotoUpload(container, user) {
  const form = container.querySelector('#sunday-school-photo-form')
  const button = form?.querySelector('#upload-sunday-school-photo-button')
  button?.addEventListener('click', async () => {
    const type = form.querySelector('#sunday-school-photo-type').value
    const controls = [...form.elements, ...container.querySelectorAll('[data-edit-photo], [data-archive-photo], [data-delete-photo]')]
    controls.forEach(control => { control.disabled = true })
    button.textContent = 'Uploading...'
    try {
      const uploaded = await chooseAndUploadSundaySchoolMedia({
        uid: user?.uid,
        type,
        onProgress: progress => {
          if (form.isConnected) button.textContent = `Uploading… ${Math.round(progress * 100)}%`
        }
      })
      if (uploaded && !form.isConnected) {
        await deleteSundaySchoolGalleryMedia(uploaded.path)
        return
      }
      if (uploaded) {
        form.querySelector('#sunday-school-photo-type').value = uploaded.mediaType
        form.querySelector('#sunday-school-photo-image').value = uploaded.url
        form.querySelector('#sunday-school-photo-path').value = uploaded.path
        form.querySelector('#sunday-school-photo-mime').value = uploaded.mimeType
        form.querySelector('#sunday-school-photo-size').value = uploaded.size
      }
    } catch (error) {
      if (form.isConnected) alert(`Unable to upload: ${error?.message || error}`)
    } finally {
      if (form.isConnected) {
        controls.forEach(control => { control.disabled = false })
        button.textContent = 'Upload Photo or Video'
      }
    }
  })
}
