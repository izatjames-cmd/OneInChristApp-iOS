import { createScripturePreparationMessage, subscribeScripturePreparationMessages } from './scripturePreparationStore.js'
import { bindSundaySchoolVoiceRecorder } from '../ministry/sunday-school/sundaySchoolVoiceRecorder.js'

export async function renderScripturePreparationCommunication({ container, user }) {
  container.innerHTML = `
    <section class="scripture-communication-card" style="background:#fff;border:1px solid #e5dccb;border-radius:14px;padding:16px;">
      <h3 style="margin:0 0 6px">Preacher and Admin Communication</h3>
      <p style="margin:0 0 14px;color:#665f55">Send a text message or an optional voice message.</p>
      <div data-scripture-message-list style="display:grid;gap:8px;max-height:260px;overflow:auto;margin-bottom:14px"><p>Loading messages...</p></div>
      <textarea data-scripture-message-text rows="3" placeholder="Write a message" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:8px"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button type="button" data-voice-record>Record voice message</button>
        <button type="button" data-voice-stop disabled>Stop recording</button>
        <button type="button" data-voice-remove disabled>Remove voice</button>
        <button type="button" data-scripture-message-send>Send message</button>
      </div>
      <p data-voice-status style="min-height:20px;color:#665f55"></p>
      <audio data-voice-preview controls hidden style="width:100%"></audio>
      <p data-scripture-message-status style="min-height:20px"></p>
    </section>`
  const list = container.querySelector('[data-scripture-message-list]')
  const status = container.querySelector('[data-scripture-message-status]')
  const recorder = bindSundaySchoolVoiceRecorder({ container, isActive: () => container.isConnected, onChange: () => {} })
  const render = messages => {
    list.innerHTML = messages.length ? messages.map(item => `<article style="padding:10px;border-radius:10px;background:#f7f2e9"><strong>${escapeHtml(item.senderName || 'Preacher/Admin')}</strong><small style="display:block;color:#777">${formatDate(item.createdAt)}</small>${item.message ? `<div style="white-space:pre-wrap;margin-top:4px">${escapeHtml(item.message)}</div>` : ''}${item.audioBase64 ? `<audio controls src="${item.audioBase64}" style="width:100%;margin-top:6px"></audio>` : ''}</article>`).join('') : '<p>No messages yet.</p>'
    list.scrollTop = list.scrollHeight
  }
  const unsubscribe = await subscribeScripturePreparationMessages(render, error => { list.innerHTML = '<p>Unable to load messages.</p>'; console.error(error) })
  container.querySelector('[data-scripture-message-send]').addEventListener('click', async () => {
    const message = container.querySelector('[data-scripture-message-text]').value.trim()
    const audio = recorder.getAudio()
    if (!message && !audio.audioBase64) { status.textContent = 'Write a message or record a voice message first.'; return }
    status.textContent = 'Sending...'
    try {
      await createScripturePreparationMessage({ uid: user?.uid, senderName: user?.displayName || user?.email || 'Preacher/Admin', message, ...audio })
      container.querySelector('[data-scripture-message-text]').value = ''
      recorder.clear()
      status.textContent = 'Message sent.'
    } catch (error) { status.textContent = error?.message || 'Unable to send message.' }
  })
  return () => { unsubscribe?.(); recorder.cleanup() }
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char])) }
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleString() }
