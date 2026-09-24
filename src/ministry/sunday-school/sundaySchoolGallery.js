import { getSundaySchoolGallery } from './sundaySchoolStore.js'

export async function renderSundaySchoolGallery({ container }) {
  let closed = false
  const events = (await getSundaySchoolGallery()).filter(item => item.active === true)
  if (closed || !container.isConnected) return () => { closed = true }
  container.innerHTML = `<section class="sunday-school-gallery sunday-school-view-only-gallery"><header class="page-header"><h2>Sunday School Gallery</h2><p>Open an event to view its pictures.</p></header>${events.length ? events.map(createEventMarkup).join('') : '<p>No published galleries yet.</p>'}<div data-gallery-viewer-host></div></section>`
  container.querySelectorAll('[data-gallery-event]').forEach(details => details.addEventListener('toggle', () => { if (details.open) details.querySelectorAll('[data-gallery-picture]').forEach((picture, index) => { picture.onclick = () => openViewer(details, index) }) }))
  return () => { closed = true; container.querySelectorAll('video').forEach(video => video.pause()); container.querySelector('[data-gallery-viewer-host]')?.replaceChildren() }
}

function eventMedia(item) { return Array.isArray(item.mediaItems) && item.mediaItems.length ? item.mediaItems : [{ mediaType: item.mediaType || (item.video ? 'video' : 'image'), mediaUrl: item.mediaUrl || item.video || item.image }] }
function createEventMarkup(item) {
  const media = eventMedia(item)
  return `<details class="sunday-school-gallery-event" data-gallery-event><summary><strong>${escapeHtml(item.date || 'No date')}</strong><span>${escapeHtml(item.title || 'Sunday School event')}</span></summary><div class="sunday-school-gallery-strip">${media.map((entry, index) => { const url = entry.mediaUrl || entry.url || entry.image || entry.video || ''; return entry.mediaType === 'video' ? `<video data-gallery-picture="${index}" src="${escapeHtml(url)}" controls playsinline preload="metadata"></video>` : `<img data-gallery-picture="${index}" src="${escapeHtml(url)}" alt="${escapeHtml(item.title || 'Gallery picture')} ${index + 1}" loading="lazy">` }).join('')}</div><p>${escapeHtml(item.description || '')}</p></details>`
}
function openViewer(details, start) {
  const pictures = [...details.querySelectorAll('[data-gallery-picture]')]; let index = start
  const host = details.closest('section').querySelector('[data-gallery-viewer-host]'); const viewer = document.createElement('div'); viewer.className = 'sunday-school-gallery-viewer'
  viewer.innerHTML = '<button type="button" data-close>Close</button><button type="button" data-prev aria-label="Previous picture">‹</button><figure><img data-image alt=""><figcaption data-count></figcaption></figure><button type="button" data-next aria-label="Next picture">›</button>'
  const image = viewer.querySelector('[data-image]'); const count = viewer.querySelector('[data-count]')
  const show = () => { const picture = pictures[index]; image.src = picture.currentSrc || picture.src; image.alt = picture.alt; count.textContent = `Picture ${index + 1} of ${pictures.length}` }
  viewer.querySelector('[data-prev]').onclick = () => { index = (index - 1 + pictures.length) % pictures.length; show() }; viewer.querySelector('[data-next]').onclick = () => { index = (index + 1) % pictures.length; show() }; viewer.querySelector('[data-close]').onclick = () => viewer.remove()
  let startX = 0; viewer.addEventListener('touchstart', event => { startX = event.changedTouches[0].screenX }, { passive: true }); viewer.addEventListener('touchend', event => { const delta = event.changedTouches[0].screenX - startX; if (Math.abs(delta) > 40) { index = (index + (delta < 0 ? 1 : -1) + pictures.length) % pictures.length; show() } }, { passive: true })
  host.replaceChildren(viewer); show()
}
function escapeHtml(input) { return String(input || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;') }
