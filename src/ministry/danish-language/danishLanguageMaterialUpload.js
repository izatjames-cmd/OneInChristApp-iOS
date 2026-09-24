import {
  FirebaseStorage
} from '@capacitor-firebase/storage'

import {
  FilePicker
} from '@capawesome/capacitor-file-picker'


function sanitizeFileName(value) {
  return String(value || 'material')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
}


function normalizeNativeUri(path) {
  const value = String(path || '').trim()
  if (!value) return ''
  if (value.startsWith('content://') || value.startsWith('file://')) return value
  if (value.startsWith('/')) return `file://${value}`
  return value
}


function uploadFileToStorage({
  storagePath,
  file
}) {

  return new Promise(
    async (
      resolve,
      reject
    ) => {

      try {

        const options = {
          path:
            storagePath,

          metadata: {
            contentType:
              file.mimeType || 'application/octet-stream'
          }
        }


        if (file.blob) {
          options.blob =
            file.blob
        } else {
          options.uri =
            normalizeNativeUri(
              file.path
            )
        }


        if (!options.blob && !options.uri) {
          throw new Error(
            'Unable to access the selected file.'
          )
        }


        await FirebaseStorage.uploadFile(
          options,
          (
            event,
            error
          ) => {

            if (error) {
              reject(error)
              return
            }


            if (event?.completed === true) {
              resolve()
            }
          }
        )

      } catch (error) {
        reject(error)
      }
    }
  )
}


export async function chooseDanishLanguageMaterialFile({
  uid
}) {

  if (!uid) {
    throw new Error(
      'You must be signed in.'
    )
  }


  const result =
    await FilePicker.pickFiles({
      limit:
        1,

      readData:
        false
    })


  const file =
    result?.files?.[0]


  if (!file) {
    return null
  }


  const maximumSize =
    25 *
    1024 *
    1024


  if (
    file.size &&
    file.size >
      maximumSize
  ) {
    throw new Error(
      'The selected file is too large. Maximum size is 25 MB.'
    )
  }


  const fileName =
    sanitizeFileName(
      file.name || 'material'
    )

  const storagePath =
    `danishLanguageMaterials/${uid}/${Date.now()}_${fileName}`


  await uploadFileToStorage({
    storagePath,
    file
  })


  const downloadResult =
    await FirebaseStorage.getDownloadUrl({
      path:
        storagePath
    })


  if (!downloadResult?.downloadUrl) {
    throw new Error(
      'The file uploaded, but Firebase did not return a download URL.'
    )
  }


  return {
    fileName:
      file.name || 'Course material',

    filePath:
      storagePath,

    fileUrl:
      downloadResult.downloadUrl,

    fileMimeType:
      file.mimeType || '',

    fileSize:
      file.size || 0
  }
}


export async function deleteDanishLanguageMaterialFile(
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
