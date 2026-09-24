import {
  getDanishLanguageMaterials,
  createDanishLanguageMaterialMessage,
  subscribeDanishLanguageMaterialMessages
} from './danishLanguageStore.js'

import {
  escapeHtml
} from './danishLanguageFormat.js'

import { canViewDanishLanguage } from './danishLanguagePermissions.js'
import { bindSundaySchoolVoiceRecorder } from '../sunday-school/sundaySchoolVoiceRecorder.js'


export async function renderDanishLanguageMaterials({ container, user, member, adminAccess }) {

  const materials =
    await getDanishLanguageMaterials()

  container.innerHTML =
    `
      <header class="danish-language-page-header">
        <h2>Course Materials</h2>
      </header>

      <div class="danish-language-list">
        ${
          materials.length
            ? materials
                .map(createMaterialMarkup)
                .join('')
            : '<p>No Danish Language materials have been added yet.</p>'
        }
      </div>
      ${canViewDanishLanguage(member, adminAccess) ? createChatMarkup() : ''}
    `

  if (!canViewDanishLanguage(member, adminAccess)) return
  bindMaterialChat({ container, user, member })
}

function createChatMarkup() {
  return `<section class="dashboard-card danish-language-material-chat"><h3>Student &amp; Admin Discussion</h3><div data-danish-message-list class="danish-language-message-list"><p>Loading comments...</p></div><p data-danish-chat-status role="status"></p><form data-danish-message-form><input name="title" placeholder="Comment title (optional)"><textarea name="message" rows="3" placeholder="Write a comment or record a voice message"></textarea><div class="sunday-school-voice-controls"><button type="button" data-voice-record>Record voice message</button><button type="button" data-voice-stop disabled>Stop recording</button><button type="button" data-voice-remove disabled>Remove recording</button></div><p data-voice-status role="status"></p><audio data-voice-preview hidden controls></audio><button type="submit">Send Comment</button></form></section>`
}

function bindMaterialChat({ container, user, member }) {
  const form = container.querySelector('[data-danish-message-form]')
  const list = container.querySelector('[data-danish-message-list]')
  const status = container.querySelector('[data-danish-chat-status]')
  let alive = true; let unsubscribe = null; let voice
  voice = bindSundaySchoolVoiceRecorder({ container: form, isActive: () => alive && container.isConnected, onChange: () => {} })
  subscribeDanishLanguageMaterialMessages(messages => {
    if (!alive) return
    list.innerHTML = messages.length ? messages.map(message => `<article class="danish-language-message"><p><strong>${escapeHtml(message.name || 'Student/Admin')}</strong></p>${message.title ? `<strong>${escapeHtml(message.title)}</strong>` : ''}${message.message ? `<p>${escapeHtml(message.message)}</p>` : ''}${message.audioBase64 ? `<audio controls preload="none" src="${escapeHtml(message.audioBase64)}"></audio>` : ''}</article>`).join('') : '<p>No comments yet.</p>'
  }, error => { if (alive) status.textContent = `Unable to load comments: ${error?.message || error}` }).then(cleanup => { if (alive) unsubscribe = cleanup; else cleanup() })
  form.addEventListener('submit', async event => {
    event.preventDefault(); const audio = voice.getAudio(); const message = form.elements.message.value.trim()
    if (!message && !audio.audioBase64) { status.textContent = 'Write a comment or record a voice message.'; return }
    try { await createDanishLanguageMaterialMessage({ uid: user?.uid || '', name: member?.name || user?.email || 'Student', title: form.elements.title.value.trim(), message, ...audio }); form.reset(); voice.clear(); status.textContent = 'Comment sent.' } catch (error) { status.textContent = `Unable to send comment: ${error?.message || error}` }
  })
  return () => { alive = false; voice.cleanup(); unsubscribe?.() }
}


function createMaterialMarkup(
  item
) {

  const materialUrl =
    item.fileUrl ||
    item.link

  const materialName =
    item.fileName ||
    item.title ||
    'Course Material'


  return `
    <article class="dashboard-card">
      <h3>${escapeHtml(item.title || 'Course Material')}</h3>
      <p><strong>${escapeHtml(item.type || 'Material')}</strong></p>
      <p>${escapeHtml(item.description || '')}</p>
      ${
        materialUrl
          ? `
              <p>${escapeHtml(materialName)}</p>
              <p>
                <a href="${escapeHtml(materialUrl)}" target="_blank" rel="noreferrer">
                  Open / Download Material
                </a>
              </p>
            `
          : ''
      }
    </article>
  `
}
