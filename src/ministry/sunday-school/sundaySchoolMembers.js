/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolMembers.js
 *
 * Purpose:
 * Displays Sunday School teachers and teacher tools.
 * ============================================================
 */

import {
  getSundaySchoolTeachers,
  getSundaySchoolClasses,
  createSundaySchoolTeacherMessage,
  subscribeSundaySchoolTeacherMessages
} from './sundaySchoolStore.js'

import {
  canTeachSundaySchool
} from './sundaySchoolPermissions.js'

import {
  bindSundaySchoolVoiceRecorder
} from './sundaySchoolVoiceRecorder.js'


export function renderSundaySchoolMembers({
  container,
  user,
  member,
  adminAccess
}) {
  const canTeach = canTeachSundaySchool(member, adminAccess)
  let active = true
  let cleanupChat = null
  const isActive = () => active && container.isConnected

  // Return the cleanup immediately, including while the initial reads are pending.
  Promise.all([getSundaySchoolTeachers(), getSundaySchoolClasses()])
    .then(([teachers, classes]) => {
      if (!isActive()) return
      container.innerHTML = `
        <section class="sunday-school-teachers">
          <header class="page-header">
            <h2>Teachers</h2>
          </header>

          ${
            teachers.length
              ? teachers.map(createTeacherMarkup).join('')
              : '<p>No teacher profiles have been created yet.</p>'
          }

          ${canTeach ? createTeacherToolsMarkup(classes) : ''}
        </section>
      `
      if (canTeach) cleanupChat = bindTeacherMessageForm({ container, user, member, isActive })
    })
    .catch(error => {
      if (!isActive()) return
      container.textContent = `Unable to load teachers: ${error?.message || error}`
    })

  return () => {
    active = false
    cleanupChat?.()
  }
}


function createTeacherMarkup(teacher) {
  return `
    <article class="dashboard-card sunday-school-teacher-card">
      ${teacher.photo ? `<img src="${escapeAttribute(teacher.photo)}" alt="${escapeAttribute(teacher.name || 'Teacher')}">` : ''}
      <h3>${escapeHtml(teacher.name || 'Teacher')}</h3>
      <p><strong>Role:</strong> ${escapeHtml(teacher.role || '')}</p>
      <p><strong>Age Group:</strong> ${escapeHtml(teacher.ageGroup || '')}</p>
      <p>${escapeHtml(teacher.introduction || '')}</p>
    </article>
  `
}


function createTeacherToolsMarkup(classes) {
  return `
    <section class="dashboard-card sunday-school-teacher-chat">
      <h3>Teacher Tools</h3>
      <h4>Teachers &amp; Admin Chat</h4>
      <p>Messages here are shared with Sunday School teachers and administrators.</p>
      <div class="sunday-school-teacher-message-list" data-teacher-message-list role="region" aria-label="Teachers and administrators messages" tabindex="0">
        <p>Loading messages...</p>
      </div>
      <p data-teacher-chat-status role="status"></p>
      <form id="sunday-school-teacher-message-form" class="sunday-school-form">
        <label for="sunday-school-teacher-message-title">Message title (optional)</label>
        <input id="sunday-school-teacher-message-title" name="title" placeholder="Message title" maxlength="160">
        <label for="sunday-school-teacher-message-text">Message</label>
        <textarea id="sunday-school-teacher-message-text" name="message" rows="4" maxlength="10000" placeholder="Write to Sunday School teachers and administrators, or record a voice message"></textarea>
        <div class="sunday-school-voice-controls">
          <button type="button" data-voice-record>Record voice message</button>
          <button type="button" data-voice-stop disabled>Stop recording</button>
          <button type="button" data-voice-remove disabled>Remove recording</button>
        </div>
        <small>Voice messages can be up to 2 minutes.</small>
        <p data-voice-status role="status"></p>
        <audio class="sunday-school-voice-preview" data-voice-preview controls preload="metadata" aria-label="Voice message preview" hidden></audio>
        <button type="submit" data-teacher-message-send>Send Message</button>
      </form>
      <p id="sunday-school-teacher-message-status" role="status"></p>
    </section>

    <section class="dashboard-card">
      <h3>Upcoming Classes</h3>
      ${
        classes.length
          ? classes.map(item => `<p><strong>${escapeHtml(item.title || 'Class')}</strong><br>${escapeHtml(item.date || '')} ${escapeHtml(item.time || '')}</p>`).join('')
          : '<p>No upcoming classes.</p>'
      }
    </section>
  `
}


function bindTeacherMessageForm({ container, user, member, isActive }) {
  const form = container.querySelector('#sunday-school-teacher-message-form')
  const status = container.querySelector('#sunday-school-teacher-message-status')
  const list = container.querySelector('[data-teacher-message-list]')
  const chatStatus = container.querySelector('[data-teacher-chat-status]')
  const sendButton = form.querySelector('[data-teacher-message-send]')
  const titleInput = form.elements.namedItem('title')
  const messageInput = form.elements.namedItem('message')
  let sending = false
  let active = true
  let voice = null
  let unsubscribe = null
  let receivedMessages = false
  const alive = () => active && isActive()

  function updateSendButton() {
    sendButton.disabled = sending || Boolean(voice?.isBusy())
  }

  voice = bindSundaySchoolVoiceRecorder({ container: form, isActive: alive, onChange: updateSendButton })

  subscribeSundaySchoolTeacherMessages(messages => {
    if (!alive()) return
    const shouldScroll = !receivedMessages || list.scrollHeight - list.scrollTop - list.clientHeight < 80
    receivedMessages = true
    chatStatus.textContent = ''
    renderTeacherMessages(list, messages, user?.uid)
    if (shouldScroll) list.scrollTop = list.scrollHeight
  }, error => {
    if (!alive()) return
    if (!receivedMessages) list.innerHTML = ''
    chatStatus.textContent = `Unable to load messages: ${error?.message || error}`
  }).then(cleanup => {
    if (alive()) unsubscribe = cleanup
    else Promise.resolve(cleanup()).catch(error => console.error('Unable to close Sunday School chat:', error))
  }).catch(error => {
    if (!alive()) return
    list.innerHTML = ''
    chatStatus.textContent = `Unable to load messages: ${error?.message || error}`
  })

  async function sendMessage(event) {
    event.preventDefault()
    if (!alive() || sending || voice.isBusy()) return
    const message = messageInput.value.trim()
    const audio = voice.getAudio()
    if (!message && !audio.audioBase64) {
      status.textContent = 'Write a message or record a voice message before sending.'
      return
    }
    sending = true
    titleInput.disabled = true
    messageInput.disabled = true
    voice.setDisabled(true)
    sendButton.textContent = 'Sending...'
    status.textContent = ''
    try {
      await createSundaySchoolTeacherMessage({
        title: titleInput.value.trim() || (audio.audioBase64 ? 'Voice message' : 'Message'),
        message,
        uid: user?.uid || '',
        name: member?.name || user?.displayName || user?.email || 'Teacher',
        ...audio
      })
      if (!alive()) return
      form.reset()
      voice.clear()
      status.textContent = 'Message sent.'
    } catch (error) {
      if (alive()) status.textContent = `Unable to send message: ${error?.message || error}`
    } finally {
      sending = false
      if (alive()) {
        titleInput.disabled = false
        messageInput.disabled = false
        voice.setDisabled(false)
        sendButton.textContent = 'Send Message'
      }
    }
  }

  form.addEventListener('submit', sendMessage)
  return () => {
    active = false
    voice.cleanup()
    form.removeEventListener('submit', sendMessage)
    list.querySelectorAll('audio').forEach(audio => audio.pause())
    if (unsubscribe) Promise.resolve(unsubscribe()).catch(error => console.error('Unable to close Sunday School chat:', error))
  }
}


function renderTeacherMessages(list, messages, currentUid) {
  if (!messages.length) {
    list.innerHTML = '<p>No messages yet. Start the conversation below.</p>'
    return
  }
  if (!list.querySelector('[data-teacher-message-id]')) list.innerHTML = ''
  const existing = new Map(Array.from(list.querySelectorAll('[data-teacher-message-id]'), item => [item.dataset.teacherMessageId, item]))
  let position = 0
  for (const message of messages) {
    const id = String(message.id)
    const markup = createTeacherMessageMarkup(message)
    let item = existing.get(id)
    if (!item) {
      item = document.createElement('article')
      item.dataset.teacherMessageId = id
    }
    item.className = `sunday-school-teacher-message${message.uid === currentUid ? ' is-own' : ''}`
    // Preserve audio playback when another participant sends a new message.
    if (item.savedMessageMarkup !== markup) {
      item.querySelectorAll('audio').forEach(audio => audio.pause())
      item.innerHTML = markup
      item.savedMessageMarkup = markup
    }
    existing.delete(id)
    const next = list.children[position++]
    if (next !== item) list.insertBefore(item, next || null)
  }
  existing.forEach(item => {
    item.querySelectorAll('audio').forEach(audio => audio.pause())
    item.remove()
  })
}


function createTeacherMessageMarkup(message) {
  const createdAt = new Date(message.createdAt || '')
  const dateLabel = Number.isNaN(createdAt.getTime()) ? '' : createdAt.toLocaleString([], {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
  const audio = /^data:audio\/[a-z0-9.+-]+(?:;codecs=[a-z0-9.,-]+)?;base64,[a-z0-9+/=]+$/i.test(String(message.audioBase64 || ''))
    ? String(message.audioBase64)
    : ''
  return `
    <p class="sunday-school-message-meta"><strong>${escapeHtml(message.name || 'Teacher')}</strong>${dateLabel ? ` <time>${escapeHtml(dateLabel)}</time>` : ''}</p>
    ${message.title ? `<strong>${escapeHtml(message.title)}</strong>` : ''}
    ${message.message ? `<p class="sunday-school-message-text">${escapeHtml(message.message)}</p>` : ''}
    ${audio ? `<audio controls preload="none" src="${escapeAttribute(audio)}" aria-label="Voice message from ${escapeAttribute(message.name || 'Teacher')}"></audio>` : ''}
  `
}


function escapeAttribute(input) {
  return escapeHtml(input)
}


function escapeHtml(input) {
  return String(input || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
