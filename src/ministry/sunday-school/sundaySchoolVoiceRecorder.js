import {
  MAX_SUNDAY_SCHOOL_AUDIO_BYTES,
  MAX_SUNDAY_SCHOOL_AUDIO_SECONDS,
  saveSundaySchoolVoiceMessage
} from './sundaySchoolVoiceStore.js'


export function bindSundaySchoolVoiceRecorder({ container, isActive, onChange }) {
  const recordButton = container.querySelector('[data-voice-record]')
  const stopButton = container.querySelector('[data-voice-stop]')
  const removeButton = container.querySelector('[data-voice-remove]')
  const preview = container.querySelector('[data-voice-preview]')
  const status = container.querySelector('[data-voice-status]')
  let active = true
  let disabled = false
  let phase = 'idle'
  let stream = null
  let recorder = null
  let timer = null
  let recordingId = 0
  let startedAt = 0
  let durationSeconds = 0
  let audioBase64 = ''

  const alive = () => active && isActive()
  const isBusy = () => ['requesting', 'recording', 'stopping', 'preparing'].includes(phase)
  const elapsed = () => Math.min(MAX_SUNDAY_SCHOOL_AUDIO_SECONDS, Math.max(0, (performance.now() - startedAt) / 1000))

  function updateControls() {
    if (!alive()) return
    recordButton.disabled = disabled || isBusy()
    recordButton.textContent = audioBase64 ? 'Record again' : 'Record voice message'
    stopButton.disabled = disabled || phase !== 'recording'
    removeButton.disabled = disabled || isBusy() || !audioBase64
    onChange()
  }

  function stopStream() {
    stream?.getTracks().forEach(track => track.stop())
    stream = null
    clearInterval(timer)
    timer = null
  }

  function clearAudio() {
    preview.pause()
    preview.removeAttribute('src')
    preview.load()
    preview.hidden = true
    audioBase64 = ''
    durationSeconds = 0
  }

  function cancelRecording() {
    recordingId += 1
    const previousRecorder = recorder
    recorder = null
    if (previousRecorder && previousRecorder.state !== 'inactive') {
      try { previousRecorder.stop() } catch { /* Tracks are always stopped below. */ }
    }
    stopStream()
    phase = audioBase64 ? 'ready' : 'idle'
  }

  function fail(error) {
    cancelRecording()
    if (!alive()) return
    status.textContent = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError'
      ? 'Microphone access was denied. Allow microphone access for OneInChrist, then try again.'
      : `Unable to record: ${error?.message || error}`
    updateControls()
  }

  function stopRecording() {
    if (phase !== 'recording' || !recorder) return
    durationSeconds = elapsed()
    phase = 'stopping'
    clearInterval(timer)
    timer = null
    status.textContent = 'Preparing voice message...'
    updateControls()
    try {
      recorder.stop()
      // Release the microphone immediately; the final data/stop events still finish the clip.
      stopStream()
    } catch (error) {
      fail(error)
    }
  }

  async function startRecording() {
    if (!alive() || disabled || isBusy()) return
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      status.textContent = 'Audio recording is not available on this device.'
      return
    }
    const currentId = ++recordingId
    phase = 'requesting'
    status.textContent = 'Waiting for microphone access...'
    preview.pause()
    updateControls()

    try {
      const acquiredStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!alive() || currentId !== recordingId) {
        acquiredStream.getTracks().forEach(track => track.stop())
        return
      }
      stream = acquiredStream
      clearAudio()
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find(type => window.MediaRecorder.isTypeSupported?.(type)) || ''
      const currentRecorder = new window.MediaRecorder(stream, {
        audioBitsPerSecond: 32000,
        ...(mimeType ? { mimeType } : {})
      })
      recorder = currentRecorder
      const chunks = []
      let totalBytes = 0

      currentRecorder.addEventListener('dataavailable', event => {
        if (!alive() || currentId !== recordingId || !event.data?.size) return
        totalBytes += event.data.size
        if (totalBytes > MAX_SUNDAY_SCHOOL_AUDIO_BYTES) {
          fail(new Error('The voice message is too large. Please record a shorter message.'))
          return
        }
        chunks.push(event.data)
      })
      currentRecorder.addEventListener('error', event => {
        if (alive() && currentId === recordingId) fail(event.error || new Error('Recording stopped unexpectedly.'))
      })
      currentRecorder.addEventListener('stop', async () => {
        if (!alive() || currentId !== recordingId) return
        if (phase === 'recording') durationSeconds = elapsed()
        stopStream()
        recorder = null
        phase = 'preparing'
        updateControls()
        try {
          const blob = new Blob(chunks, { type: currentRecorder.mimeType || mimeType || 'audio/webm' })
          const preparedAudio = await saveSundaySchoolVoiceMessage(blob)
          if (!alive() || currentId !== recordingId) return
          audioBase64 = preparedAudio
          preview.src = audioBase64
          preview.hidden = false
          phase = 'ready'
          status.textContent = 'Voice message ready. Listen before sending, or remove it to record again.'
          updateControls()
        } catch (error) {
          if (alive() && currentId === recordingId) fail(error)
        }
      })

      startedAt = performance.now()
      currentRecorder.start(250)
      phase = 'recording'
      status.textContent = 'Recording 0:00 / 2:00. Tap Stop recording when finished.'
      updateControls()
      timer = setInterval(() => {
        if (!alive()) {
          cleanup()
          return
        }
        const seconds = Math.floor(elapsed())
        status.textContent = `Recording ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} / 2:00. Tap Stop recording when finished.`
        if (seconds >= MAX_SUNDAY_SCHOOL_AUDIO_SECONDS) stopRecording()
      }, 250)
    } catch (error) {
      if (alive() && currentId === recordingId) fail(error)
    }
  }

  function removeAudio() {
    if (!alive() || disabled || isBusy()) return
    clearAudio()
    phase = 'idle'
    status.textContent = 'Voice message removed.'
    updateControls()
  }

  function handleVisibilityChange() {
    if (!document.hidden) return
    if (phase === 'recording') stopRecording()
    else if (phase === 'requesting') {
      cancelRecording()
      status.textContent = 'Recording cancelled. Tap Record voice message to try again.'
      updateControls()
    }
  }

  function cleanup() {
    if (!active) return
    active = false
    cancelRecording()
    clearAudio()
    recordButton.removeEventListener('click', startRecording)
    stopButton.removeEventListener('click', stopRecording)
    removeButton.removeEventListener('click', removeAudio)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  recordButton.addEventListener('click', startRecording)
  stopButton.addEventListener('click', stopRecording)
  removeButton.addEventListener('click', removeAudio)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  updateControls()

  return {
    isBusy,
    getAudio: () => ({ audioBase64, audioDurationSeconds: Math.round(durationSeconds) }),
    setDisabled(value) {
      disabled = value
      updateControls()
    },
    clear() {
      clearAudio()
      phase = 'idle'
      status.textContent = ''
      updateControls()
    },
    cleanup
  }
}
