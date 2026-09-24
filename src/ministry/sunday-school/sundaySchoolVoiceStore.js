// Use the same compact Firestore audio attachment format as Choir.
export const MAX_SUNDAY_SCHOOL_AUDIO_BYTES = 700 * 1024
export const MAX_SUNDAY_SCHOOL_AUDIO_SECONDS = 120

export function saveSundaySchoolVoiceMessage(audioBlob) {
  if (!audioBlob?.size) {
    return Promise.reject(new Error('No audio was recorded. Please try again.'))
  }
  if (audioBlob.size > MAX_SUNDAY_SCHOOL_AUDIO_BYTES) {
    return Promise.reject(new Error('The voice message is too large. Please record a shorter message.'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result))
    reader.addEventListener('error', () => reject(reader.error || new Error('Unable to prepare the voice message.')))
    reader.readAsDataURL(audioBlob)
  })
}
