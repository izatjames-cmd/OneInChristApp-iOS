/** Upload Sunday School gallery photos and videos to Firebase Storage. */
import { FirebaseStorage } from '@capacitor-firebase/storage'
import { FilePicker } from '@capawesome/capacitor-file-picker'

function sanitizeFileName(value) {
  return String(value || 'media').replace(/[^a-zA-Z0-9._-]/g, '_')
}

function normalizeNativeUri(path) {
  const value = String(path || '').trim()
  return value.startsWith('/') ? `file://${value}` : value
}

function uploadMedia(options, onProgress) {
  // uploadFile's promise returns a callback ID, not upload completion.
  return new Promise((resolve, reject) => {
    FirebaseStorage.uploadFile(options, (event, error) => {
      if (error) {
        reject(error)
        return
      }
      if (typeof event?.progress === 'number') onProgress?.(event.progress)
      if (event?.completed === true) resolve()
    }).catch(reject)
  })
}

async function compressImageBlob(blob) {
  if (!blob || typeof document === 'undefined') return blob
  const bitmap = await createImageBitmap(blob).catch(() => null)
  if (!bitmap) return blob
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.78)) || blob
}

export async function chooseAndUploadSundaySchoolMedia({ uid, type = 'image', onProgress }) {
  if (!uid) throw new Error('You must be signed in.')
  if (!['image', 'video'].includes(type)) throw new Error('Please select a photo or video.')

  let result
  try {
    const options = { limit: 1, readData: false }
    result = type === 'video'
      ? await FilePicker.pickVideos(options)
      : await FilePicker.pickImages(options)
  } catch (error) {
    if (/cancel/i.test(String(error?.message || error))) return null
    throw error
  }

  const file = result?.files?.[0]
  if (!file) return null
  const mimeType = String(file.mimeType || file.blob?.type || '').toLowerCase()
  if (!mimeType.startsWith(`${type}/`)) {
    throw new Error(`Please select ${type === 'video' ? 'a video' : 'an image'} file.`)
  }
  const maximumMB = type === 'video' ? 100 : 10
  const size = Number(file.size || file.blob?.size || 0)
  if (size > maximumMB * 1024 * 1024) {
    throw new Error(`The selected file is too large. Maximum size is ${maximumMB} MB.`)
  }

  const storagePath = `sundaySchoolGallery/${uid}/${Date.now()}_${sanitizeFileName(file.name)}`
  const options = { path: storagePath, metadata: { contentType: mimeType } }
  if (file.blob) options.blob = type === 'image' ? await compressImageBlob(file.blob) : file.blob
  else options.uri = normalizeNativeUri(file.path)
  if (!options.blob && !options.uri) throw new Error('Unable to access the selected file.')

  await uploadMedia(options, onProgress)
  let downloadUrl
  try {
    const result = await FirebaseStorage.getDownloadUrl({ path: storagePath })
    if (!result?.downloadUrl) {
      throw new Error('The file uploaded, but Firebase did not return a download URL.')
    }
    downloadUrl = result.downloadUrl
  } catch (error) {
    // There is no gallery record yet, so remove this otherwise orphaned upload.
    await FirebaseStorage.deleteFile({ path: storagePath }).catch(() => {})
    throw error
  }

  return {
    url: downloadUrl,
    path: storagePath,
    name: file.name || (type === 'video' ? 'Sunday School video' : 'Sunday School photo'),
    mediaType: type,
    mimeType,
    size
  }
}

// Retain the existing photo API for callers outside the gallery.
export async function chooseAndUploadSundaySchoolPhoto(options) {
  return chooseAndUploadSundaySchoolMedia({ ...options, type: 'image' })
}

// Android's picker supports limit: 0 for a multi-selection. Uploads are kept
// sequential to avoid holding ten full-size images in memory at once.
export async function chooseAndUploadSundaySchoolPhotos({ uid, onProgress }) {
  if (!uid) throw new Error('You must be signed in.')
  const result = await FilePicker.pickImages({ limit: 0, readData: false })
  const files = result?.files || []
  if (!files.length) return []
  if (files.length > 20) throw new Error('Please select no more than 20 photos at a time.')
  const uploaded = []
  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      const mimeType = String(file.mimeType || '').toLowerCase()
      if (!mimeType.startsWith('image/')) throw new Error('Only photos can be selected in a batch.')
      const size = Number(file.size || 0)
      if (size > 10 * 1024 * 1024) throw new Error('Each photo must be 10 MB or smaller.')
      const path = `sundaySchoolGallery/${uid}/${Date.now()}_${index}_${sanitizeFileName(file.name)}`
      const options = { path, metadata: { contentType: mimeType } }
      if (file.blob) options.blob = await compressImageBlob(file.blob)
      else options.uri = normalizeNativeUri(file.path)
      await uploadMedia(options, progress => onProgress?.((index + progress) / files.length))
      let url
      try {
        url = (await FirebaseStorage.getDownloadUrl({ path })).downloadUrl
        if (!url) throw new Error('Firebase did not return a download URL.')
      } catch (error) {
        await FirebaseStorage.deleteFile({ path }).catch(() => {})
        throw error
      }
      uploaded.push({ url, path, name: file.name || `Sunday School photo ${index + 1}`, mediaType: 'image', mimeType, size })
    }
    return uploaded
  } catch (error) {
    await Promise.all(uploaded.map(item => FirebaseStorage.deleteFile({ path: item.path }).catch(() => {})))
    throw error
  }
}

export async function deleteSundaySchoolGalleryMedia(path) {
  if (path) await FirebaseStorage.deleteFile({ path })
}

export function sundaySchoolGalleryMediaData(media) {
  return {
    mediaType: media.mediaType,
    mediaUrl: media.url,
    mediaPath: media.path,
    mimeType: media.mimeType || '',
    mediaSize: media.size || 0,
    image: media.mediaType === 'image' ? media.url : '',
    imagePath: media.mediaType === 'image' ? media.path : '',
    video: media.mediaType === 'video' ? media.url : '',
    videoPath: media.mediaType === 'video' ? media.path : ''
  }
}
