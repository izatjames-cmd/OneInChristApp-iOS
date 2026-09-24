/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolStore.js
 *
 * Purpose:
 * Handles Firestore operations for the Sunday School module.
 * ============================================================
 */

import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

import { FirebaseStorage } from '@capacitor-firebase/storage'
import { createChurchNotification } from '../../notifications/notificationStore.js'


const CLASSES_COLLECTION = 'sundaySchoolClasses'
const ANNOUNCEMENTS_COLLECTION = 'sundaySchoolAnnouncements'
const RESOURCES_COLLECTION = 'sundaySchoolResources'
const GALLERY_COLLECTION = 'sundaySchoolGallery'
const TEACHERS_COLLECTION = 'sundaySchoolTeachers'
const MESSAGES_COLLECTION = 'sundaySchoolTeacherMessages'


function snapshotsToItems(result) {
  if (!result?.snapshots) return []
  return result.snapshots.map(snapshot => ({
    id: snapshot.id,
    ...snapshot.data
  }))
}


function newestFirst(items) {
  return items.sort(
    (a, b) => String(b.createdAt || b.date || '')
      .localeCompare(String(a.createdAt || a.date || ''))
  )
}


function soonestFirst(items) {
  return items.sort(
    (a, b) => `${a.date || ''} ${a.time || ''}`
      .localeCompare(`${b.date || ''} ${b.time || ''}`)
  )
}


function isUpcoming(item) {
  if (!item?.date) return true
  const date = new Date(`${item.date}T${item.time || '23:59'}:00`)
  if (Number.isNaN(date.getTime())) return true
  return date.getTime() >= Date.now()
}


async function getItems(collection, sorter = newestFirst) {
  const result = await FirebaseFirestore.getCollection({
    reference: collection
  })
  return sorter(
    snapshotsToItems(result)
      .filter(item => item.archived !== true)
  )
}


async function createItem(collection, prefix, data) {
  const id = `${prefix}_${Date.now()}`
  await FirebaseFirestore.setDocument({
    reference: `${collection}/${id}`,
    data: {
      ...data,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    merge: false
  })
  return id
}


async function updateItem(collection, id, data) {
  await FirebaseFirestore.updateDocument({
    reference: `${collection}/${id}`,
    data: {
      ...data,
      updatedAt: new Date().toISOString()
    }
  })
}


async function deleteItem(collection, id) {
  await FirebaseFirestore.deleteDocument({
    reference: `${collection}/${id}`
  })
}


export async function getSundaySchoolClasses() {
  return await getItems(CLASSES_COLLECTION, soonestFirst)
}


export async function getUpcomingSundaySchoolClass() {
  const classes = await getSundaySchoolClasses()
  return classes.find(item => item.active !== false && isUpcoming(item)) || null
}


export async function createSundaySchoolClass(data) {
  return await createItem(CLASSES_COLLECTION, 'SUNDAY_SCHOOL_CLASS', data)
}


export async function updateSundaySchoolClass(id, data) {
  await updateItem(CLASSES_COLLECTION, id, data)
}


export async function deleteSundaySchoolClass(id) {
  await deleteItem(CLASSES_COLLECTION, id)
}


export async function getSundaySchoolAnnouncements() {
  return await getItems(ANNOUNCEMENTS_COLLECTION)
}


export async function getLatestSundaySchoolAnnouncement() {
  const announcements = await getSundaySchoolAnnouncements()
  return announcements.find(item => item.active !== false) || null
}


export async function createSundaySchoolAnnouncement(data) {
  return await createItem(ANNOUNCEMENTS_COLLECTION, 'SUNDAY_SCHOOL_ANNOUNCEMENT', data)
}


export async function updateSundaySchoolAnnouncement(id, data) {
  await updateItem(ANNOUNCEMENTS_COLLECTION, id, data)
}


export async function deleteSundaySchoolAnnouncement(id) {
  await deleteItem(ANNOUNCEMENTS_COLLECTION, id)
}


export async function getSundaySchoolResources() {
  return await getItems(RESOURCES_COLLECTION)
}


export async function getLatestSundaySchoolResource() {
  const resources = await getSundaySchoolResources()
  return resources.find(item => item.active !== false) || null
}


export async function createSundaySchoolResource(data) {
  return await createItem(RESOURCES_COLLECTION, 'SUNDAY_SCHOOL_RESOURCE', data)
}


export async function updateSundaySchoolResource(id, data) {
  await updateItem(RESOURCES_COLLECTION, id, data)
}


export async function deleteSundaySchoolResource(id) {
  await deleteItem(RESOURCES_COLLECTION, id)
}


export async function getSundaySchoolGallery() {
  return await getItems(GALLERY_COLLECTION)
}


export async function createSundaySchoolGalleryPhoto(data) {
  return await createItem(GALLERY_COLLECTION, 'SUNDAY_SCHOOL_PHOTO', data)
}


export async function updateSundaySchoolGalleryPhoto(id, data) {
  await updateItem(GALLERY_COLLECTION, id, data)
}


export async function deleteSundaySchoolGalleryPhoto(id) {
  const result = await FirebaseFirestore.getDocument({
    reference: `${GALLERY_COLLECTION}/${id}`
  })
  const item = result?.snapshot?.data || {}
  const paths = [
    item.mediaPath,
    item.imagePath,
    item.videoPath,
    ...(Array.isArray(item.mediaItems) ? item.mediaItems.map(media => media.path) : [])
  ].filter((path, index, all) => path && all.indexOf(path) === index)
  // Remove Storage objects first. If a real deletion error occurs, retain the
  // Firestore event so an administrator can retry rather than losing metadata.
  for (const path of paths) {
    try {
      await FirebaseStorage.deleteFile({ path })
    } catch (error) {
      if (error?.code !== 'storage/object-not-found') throw error
    }
  }
  await deleteItem(GALLERY_COLLECTION, id)
}


export async function getSundaySchoolTeachers() {
  return await getItems(TEACHERS_COLLECTION)
}


export async function createSundaySchoolTeacher(data) {
  return await createItem(TEACHERS_COLLECTION, 'SUNDAY_SCHOOL_TEACHER', data)
}


export async function updateSundaySchoolTeacher(id, data) {
  await updateItem(TEACHERS_COLLECTION, id, data)
}


export async function deleteSundaySchoolTeacher(id) {
  await deleteItem(TEACHERS_COLLECTION, id)
}


export async function createSundaySchoolTeacherMessage(data) {
  if (!data.uid) throw new Error('Please sign in again.')
  if (!String(data.message || '').trim() && !data.audioBase64) {
    throw new Error('Write a message or record a voice message before sending.')
  }
  // Include the sender so two staff members can send at the same time.
  const result = await createItem(MESSAGES_COLLECTION, `SUNDAY_SCHOOL_MESSAGE_${data.uid}`, data)
  await createChurchNotification({ title: 'New Sunday School Message', message: `${data.senderName || 'A teacher'} sent a message.`, category: 'sundaySchool', section: 'sunday-school', targetId: 'members', sendMode: 'now', uid: data.uid })
  return result
}


export async function subscribeSundaySchoolTeacherMessages(onMessages, onError) {
  let active = true
  const callbackId = await FirebaseFirestore.addCollectionSnapshotListener({
    reference: MESSAGES_COLLECTION,
    queryConstraints: [
      { type: 'orderBy', fieldPath: 'createdAt', directionStr: 'desc' },
      { type: 'limit', limit: 50 }
    ]
  }, (result, error) => {
    if (!active) return
    if (error) {
      onError?.(error)
      return
    }
    onMessages(newestFirst(snapshotsToItems(result)
      .filter(item => item.archived !== true)).reverse())
  })

  return async () => {
    if (!active) return
    active = false
    await FirebaseFirestore.removeSnapshotListener({ callbackId })
  }
}
