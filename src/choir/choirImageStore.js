import {
  FirebaseStorage
} from '@capacitor-firebase/storage'

import {
  FilePicker
} from '@capawesome/capacitor-file-picker'


function sanitizeFileName(value) {

  return String(
    value || 'lyrics.jpg'
  )
    .replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    )
}


function normalizeNativeUri(path) {

  const value =
    String(
      path || ''
    ).trim()


  if (!value) {
    return ''
  }


  /*
   * Android may return:
   *
   * content://...
   * file://...
   * /data/...
   * /storage/...
   *
   * Firebase Storage needs a URI.
   */
  if (
    value.startsWith(
      'content://'
    ) ||
    value.startsWith(
      'file://'
    )
  ) {

    return value
  }


  if (
    value.startsWith('/')
  ) {

    return `file://${value}`
  }


  return value
}


function delay(milliseconds) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  )
}


export async function chooseAndUploadLyricsImage({
  uid
}) {

  if (!uid) {

    throw new Error(
      'You must be signed in.'
    )
  }


  const result =
    await FilePicker.pickImages({
      multiple:
        false,

      readData:
        false
    })


  const file =
    result?.files?.[0]


  if (!file) {

    return null
  }


  if (!file.path) {

    throw new Error(
      'Unable to access the selected image.'
    )
  }


  const mimeType =
    file.mimeType ||
    'image/jpeg'


  if (
    !mimeType.startsWith(
      'image/'
    )
  ) {

    throw new Error(
      'Please select an image file.'
    )
  }


  const maximumSize =
    10 *
    1024 *
    1024


  if (
    file.size &&
    file.size >
      maximumSize
  ) {

    throw new Error(
      'The selected image is too large. Maximum size is 10 MB.'
    )
  }


  const safeName =
    sanitizeFileName(
      file.name ||
      'lyrics.jpg'
    )


  const storagePath =
    `choirLyrics/${uid}/${Date.now()}_${safeName}`


  const nativeUri =
    normalizeNativeUri(
      file.path
    )


  if (!nativeUri) {

    throw new Error(
      'The selected image does not have a valid file location.'
    )
  }


  console.log(
    'Uploading lyrics image:',
    {
      storagePath,
      nativeUri,
      mimeType,
      size:
        file.size || 0
    }
  )


  await uploadNativeFile({
    storagePath,
    uri:
      nativeUri
  })


  /*
   * Firebase upload reports completion,
   * but we also verify that the object
   * is visible before requesting its URL.
   */
  await waitForUploadedObject(
    storagePath
  )


  const downloadResult =
    await FirebaseStorage.getDownloadUrl({
      path:
        storagePath
    })


  if (
    !downloadResult?.downloadUrl
  ) {

    throw new Error(
      'The image uploaded, but Firebase did not return a download URL.'
    )
  }


  return {

    url:
      downloadResult.downloadUrl,

    path:
      storagePath,

    name:
      file.name ||
      'Lyrics image'
  }
}


function uploadNativeFile({
  storagePath,
  uri
}) {

  return new Promise(
    async (
      resolve,
      reject
    ) => {

      let finished =
        false


      const timeout =
        setTimeout(
          () => {

            if (finished) {
              return
            }


            finished =
              true


            reject(
              new Error(
                'Image upload timed out.'
              )
            )
          },
          60000
        )


      try {

        await FirebaseStorage.uploadFile(
          {
            path:
              storagePath,

            uri
          },

          (
            event,
            error
          ) => {

            if (finished) {
              return
            }


            if (error) {

              finished =
                true


              clearTimeout(
                timeout
              )


              console.error(
                'Firebase upload error:',
                error
              )


              reject(
                error
              )


              return
            }


            if (event) {

              console.log(
                'Lyrics upload progress:',
                event.progress,
                event.completed
              )
            }


            if (
              event?.completed ===
              true
            ) {

              finished =
                true


              clearTimeout(
                timeout
              )


              resolve()
            }
          }
        )


      } catch (error) {

        if (finished) {
          return
        }


        finished =
          true


        clearTimeout(
          timeout
        )


        reject(
          error
        )
      }
    }
  )
}


async function waitForUploadedObject(
  storagePath
) {

  const attempts =
    6


  for (
    let attempt = 1;
    attempt <= attempts;
    attempt++
  ) {

    try {

      await FirebaseStorage.getMetadata({
        path:
          storagePath
      })


      console.log(
        'Firebase confirmed uploaded image:',
        storagePath
      )


      return


    } catch (error) {

      console.log(
        `Waiting for uploaded image (${attempt}/${attempts})...`
      )


      if (
        attempt === attempts
      ) {

        console.error(
          'Uploaded object could not be found:',
          error
        )


        throw new Error(
          'Firebase could not find the uploaded image. Please try again.'
        )
      }


      await delay(
        500
      )
    }
  }
}


export async function deleteLyricsImage(
  storagePath
) {

  if (!storagePath) {
    return
  }


  await FirebaseStorage.deleteFile({
    path:
      storagePath
  })
}