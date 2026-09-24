function blobToDataUrl(
  audioBlob
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader()

      reader.addEventListener(
        'load',
        () => resolve(
          reader.result
        )
      )

      reader.addEventListener(
        'error',
        () => reject(
          reader.error
        )
      )

      reader.readAsDataURL(
        audioBlob
      )
    }
  )
}


export async function saveChoirVoiceMessage(
  audioBlob
) {

  if (!audioBlob) {
    return null
  }


  const maximumSize =
    700 *
    1024

  if (audioBlob.size > maximumSize) {
    throw new Error(
      'The voice message is too long. Please record a shorter message.'
    )
  }


  return blobToDataUrl(
    audioBlob
  )
}