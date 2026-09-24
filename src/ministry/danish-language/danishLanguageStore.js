import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'
import { createChurchNotification } from '../../notifications/notificationStore.js'


const CLASSES_COLLECTION =
  'danishLanguageClasses'

const ANNOUNCEMENTS_COLLECTION =
  'danishLanguageAnnouncements'

const MATERIALS_COLLECTION =
  'danishLanguageMaterials'

const STUDENTS_COLLECTION =
  'danishLanguageStudents'

const MATERIAL_MESSAGES_COLLECTION = 'danishLanguageMaterialMessages'


function snapshotsToItems(result) {

  if (!result?.snapshots) {
    return []
  }


  return result.snapshots.map(
    snapshot => ({
      id:
        snapshot.id,

      ...snapshot.data
    })
  )
}


function newestFirst(items) {

  return items.sort(
    (a, b) =>
      String(b.createdAt || b.date || '')
        .localeCompare(
          String(a.createdAt || a.date || '')
        )
  )
}


function soonestFirst(items) {

  return items.sort(
    (a, b) =>
      `${a.date || ''} ${a.time || ''}`
        .localeCompare(
          `${b.date || ''} ${b.time || ''}`
        )
  )
}


function isUpcoming(item) {

  if (!item?.date) {
    return true
  }


  const date =
    new Date(
      `${item.date}T${item.time || '23:59'}:00`
    )


  if (Number.isNaN(date.getTime())) {
    return true
  }


  return date.getTime() >= Date.now()
}


async function getItems(
  collection,
  sorter = newestFirst
) {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        collection
    })


  return sorter(
    snapshotsToItems(result)
      .filter(
        item =>
          item.archived !== true
      )
  )
}


async function createItem(
  collection,
  prefix,
  data
) {

  const id =
    `${prefix}_${Date.now()}`

  await FirebaseFirestore.setDocument({
    reference:
      `${collection}/${id}`,
    data: {
      ...data,
      archived:
        false,
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString()
    },
    merge:
      false
  })

  return id
}


async function updateItem(
  collection,
  id,
  data
) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${collection}/${id}`,
    data: {
      ...data,
      updatedAt:
        new Date().toISOString()
    }
  })
}


async function deleteItem(
  collection,
  id
) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `${collection}/${id}`
  })
}


export async function getDanishLanguageClasses() {
  return await getItems(CLASSES_COLLECTION, soonestFirst)
}


export async function getUpcomingDanishLanguageClass() {
  const classes =
    await getDanishLanguageClasses()

  return classes.find(
    item =>
      item.active !== false &&
      isUpcoming(item)
  ) || null
}


export async function createDanishLanguageClass(data) {
  return await createItem(CLASSES_COLLECTION, 'DANISH_LANGUAGE_CLASS', data)
}


export async function updateDanishLanguageClass(id, data) {
  await updateItem(CLASSES_COLLECTION, id, data)
}


export async function deleteDanishLanguageClass(id) {
  await deleteItem(CLASSES_COLLECTION, id)
}


export async function getDanishLanguageAnnouncements() {
  return await getItems(ANNOUNCEMENTS_COLLECTION)
}


export async function getLatestDanishLanguageAnnouncement() {
  const announcements =
    await getDanishLanguageAnnouncements()

  return announcements.find(
    item =>
      item.active !== false
  ) || null
}


export async function createDanishLanguageAnnouncement(data) {
  return await createItem(ANNOUNCEMENTS_COLLECTION, 'DANISH_LANGUAGE_ANNOUNCEMENT', data)
}


export async function updateDanishLanguageAnnouncement(id, data) {
  await updateItem(ANNOUNCEMENTS_COLLECTION, id, data)
}


export async function deleteDanishLanguageAnnouncement(id) {
  await deleteItem(ANNOUNCEMENTS_COLLECTION, id)
}


export async function getDanishLanguageMaterials() {
  return await getItems(MATERIALS_COLLECTION)
}


export async function getLatestDanishLanguageMaterial() {
  const materials =
    await getDanishLanguageMaterials()

  return materials.find(
    item =>
      item.active !== false
  ) || null
}


export async function createDanishLanguageMaterial(data) {
  return await createItem(MATERIALS_COLLECTION, 'DANISH_LANGUAGE_MATERIAL', data)
}


export async function updateDanishLanguageMaterial(id, data) {
  await updateItem(MATERIALS_COLLECTION, id, data)
}


export async function deleteDanishLanguageMaterial(id) {
  await deleteItem(MATERIALS_COLLECTION, id)
}


export async function getDanishLanguageStudents() {
  return await getItems(STUDENTS_COLLECTION)
}


export async function createDanishLanguageStudent(data) {
  return await createItem(STUDENTS_COLLECTION, 'DANISH_LANGUAGE_STUDENT', data)
}


export async function updateDanishLanguageStudent(id, data) {
  await updateItem(STUDENTS_COLLECTION, id, data)
}


export async function deleteDanishLanguageStudent(id) {
  await deleteItem(STUDENTS_COLLECTION, id)
}

export async function createDanishLanguageMaterialMessage(data) {
  if (!data.uid) throw new Error('Please sign in again.')
  if (!String(data.message || '').trim() && !data.audioBase64) throw new Error('Write a comment or record a voice message.')
  const result = await createItem(MATERIAL_MESSAGES_COLLECTION, `DANISH_LANGUAGE_MESSAGE_${data.uid}`, data)
  await createChurchNotification({ title: 'New Danish Language Message', message: `${data.senderName || 'A student or admin'} sent a message.`, category: 'danishLanguage', section: 'danish-language', targetId: 'materials', sendMode: 'now', uid: data.uid })
  return result
}

export async function subscribeDanishLanguageMaterialMessages(onMessages, onError) {
  let active = true
  const callbackId = await FirebaseFirestore.addCollectionSnapshotListener({
    reference: MATERIAL_MESSAGES_COLLECTION,
    queryConstraints: [
      { type: 'orderBy', fieldPath: 'createdAt', directionStr: 'desc' },
      { type: 'limit', limit: 50 }
    ]
  }, (result, error) => {
    if (!active) return
    if (error) return onError?.(error)
    onMessages(newestFirst(snapshotsToItems(result)).reverse())
  })
  return async () => { if (active) { active = false; await FirebaseFirestore.removeSnapshotListener({ callbackId }) } }
}
