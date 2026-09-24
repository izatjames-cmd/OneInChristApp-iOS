import { createSundaySchoolGalleryPhoto } from './sundaySchoolStore.js'
import { chooseAndUploadSundaySchoolMedia, chooseAndUploadSundaySchoolPhotos, deleteSundaySchoolGalleryMedia, sundaySchoolGalleryMediaData } from './sundaySchoolImageStore.js'
import { notifySundaySchoolGalleryPublished } from './sundaySchoolNotifications.js'

export function renderSundaySchoolCreateGallery({ container, user, onRefresh }) {
  let uploads = []
  let busy = false
  const cleanup = () => uploads.forEach(item => deleteSundaySchoolGalleryMedia(item.path).catch(() => {}))
  container.innerHTML = `<section class="sunday-school-create-gallery"><header class="page-header"><h2>Create Gallery</h2><p>Upload up to 20 pictures or a video for one Sunday School event.</p></header><form id="sunday-school-create-gallery-form" class="dashboard-card"><div class="sunday-school-action-grid"><button type="button" data-pick-gallery-photos>Choose up to 20 Photos</button><button type="button" data-pick-gallery-video>Choose Video</button></div><div data-gallery-create-preview class="sunday-school-media-preview"></div><label>Event name / title<input name="title" required maxlength="150"></label><label>Event date<input name="date" type="date" required></label><label>Event type<select name="category"><option>Sunday School</option><option>Easter</option><option>Christmas</option><option>Special Event</option><option>Other</option></select></label><textarea name="description" rows="3" placeholder="Description (optional)" maxlength="2000"></textarea><label><input name="publish" type="checkbox" checked> Publish for church members</label><button type="submit">Save Gallery Event</button><p data-create-gallery-status role="status"></p></form></section>`
  const form = container.querySelector('form'); const status = container.querySelector('[data-create-gallery-status]'); const preview = container.querySelector('[data-gallery-create-preview]')
  const setBusy = value => { busy = value; form.querySelectorAll('button,input,textarea').forEach(control => { control.disabled = value }) }
  const pick = async type => {
    if (busy) return
    setBusy(true); status.textContent = 'Selecting media...'
    try {
      const result = type === 'photos' ? await chooseAndUploadSundaySchoolPhotos({ uid: user?.uid, onProgress: value => { status.textContent = `Uploading ${Math.round(value * 100)}%` } }) : await chooseAndUploadSundaySchoolMedia({ uid: user?.uid, type: 'video', onProgress: value => { status.textContent = `Uploading ${Math.round(value * 100)}%` } })
      uploads.forEach(item => deleteSundaySchoolGalleryMedia(item.path).catch(() => {})); uploads = Array.isArray(result) ? result : (result ? [result] : [])
      preview.innerHTML = uploads.map(item => item.mediaType === 'video' ? `<video src="${escapeHtml(item.url)}" controls playsinline></video>` : `<img src="${escapeHtml(item.url)}" alt="Selected gallery photo">`).join('')
      status.textContent = uploads.length ? `${uploads.length} file${uploads.length === 1 ? '' : 's'} ready.` : ''
    } catch (error) { status.textContent = `Unable to upload: ${error?.message || error}` } finally { setBusy(false) }
  }
  form.querySelector('[data-pick-gallery-photos]').onclick = () => pick('photos'); form.querySelector('[data-pick-gallery-video]').onclick = () => pick('video')
  form.onsubmit = async event => { event.preventDefault(); if (busy || !uploads.length) { status.textContent = uploads.length ? '' : 'Choose at least one picture or video.'; return } setBusy(true); status.textContent = 'Saving gallery event...'; const entry = { title: form.elements.title.value.trim(), date: form.elements.date.value, category: form.elements.category.value, description: form.elements.description.value.trim(), active: form.elements.publish.checked, createdBy: user?.uid, mediaItems: uploads.map(sundaySchoolGalleryMediaData) }; Object.assign(entry, entry.mediaItems[0]); try { await createSundaySchoolGalleryPhoto(entry); if (entry.active) await notifySundaySchoolGalleryPublished({ uid: user?.uid, title: entry.title, date: entry.date }); uploads = []; status.textContent = entry.active ? 'Published. Church members were notified.' : 'Saved as a draft.'; await onRefresh?.() } catch (error) { status.textContent = `Unable to save: ${error?.message || error}` } finally { setBusy(false) } }
  return cleanup
}

function escapeHtml(input) { return String(input || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;') }
