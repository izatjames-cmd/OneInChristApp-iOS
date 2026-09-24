import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

import {
  createHymnRevision
} from './hymnRevisionStore.js'


const COLLECTION =
  'hymnbookEdits'


function snapshotsToEdits(
  result
) {

  return (
    result?.snapshots || []
  )
    .map(
      snapshot => ({
        id:
          snapshot.id,
        ...snapshot.data
      })
    )
    .filter(
      item =>
        item?.active !== false
    )
}


export async function getBuiltInHymnEdit(
  sourcePath
) {

  const path =
    normalizePath(
      sourcePath
    )


  if (!path) {
    return null
  }


  const result =
    await FirebaseFirestore.getDocument({
      reference:
        `${COLLECTION}/${getEditId(path)}`
    })


  if (
    !result?.snapshot?.data ||
    result.snapshot.data.active === false
  ) {
    return null
  }


  return {
    id:
      result.snapshot.id,
    ...result.snapshot.data
  }
}


export async function getAllBuiltInHymnEdits() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        COLLECTION
    })


  return snapshotsToEdits(
    result
  )
}


export async function saveBuiltInHymnEdit({
  original,
  updated,
  uid
}) {

  const sourcePath =
    normalizePath(
      updated?.sourcePath ||
      original?.sourcePath ||
      ''
    )


  if (!sourcePath) {
    throw new Error(
      'The hymn source path is missing.'
    )
  }


  const currentEdit =
    await getBuiltInHymnEdit(
      sourcePath
    )


  const previous =
    currentEdit ||
    original


  if (previous) {
    await createHymnRevision({
      sourceType:
        'built-in',
      sourcePath,
      hymnType:
        previous.type,
      urduTitle:
        previous.urduTitle,
      romanTitle:
        previous.romanTitle,
      content:
        previous.content,
      uid,
      reason:
        currentEdit
          ? 'edit'
          : 'original'
    })
  }


  const now =
    new Date()
      .toISOString()


  const data = {
    type:
      updated?.type === 'zaboor'
        ? 'zaboor'
        : 'geet',

    sourcePath,

    urduTitle:
      String(
        updated?.urduTitle || ''
      ).trim(),

    romanTitle:
      String(
        updated?.romanTitle || ''
      ).trim(),

    content:
      normalizeContent(
        updated?.content
      ),

    active:
      true,

    updatedBy:
      String(uid || ''),

    updatedAt:
      now
  }


  if (!currentEdit) {
    data.createdBy =
      String(uid || '')
    data.createdAt =
      now
  }


  await FirebaseFirestore.setDocument({
    reference:
      `${COLLECTION}/${getEditId(sourcePath)}`,

    data,

    merge:
      Boolean(currentEdit)
  })


  return {
    id:
      getEditId(sourcePath),
    ...data
  }
}


export async function restoreBuiltInHymnRevision({
  current,
  revision,
  uid
}) {

  if (
    !current?.sourcePath ||
    !revision
  ) {
    throw new Error(
      'The hymn revision could not be restored.'
    )
  }


  return saveBuiltInHymnEdit({
    original:
      current,
    updated: {
      type:
        revision.hymnType ||
        current.type,
      sourcePath:
        current.sourcePath,
      urduTitle:
        revision.urduTitle,
      romanTitle:
        revision.romanTitle,
      content:
        revision.content
    },
    uid
  })
}


export async function restoreBuiltInHymnOriginal({
  current,
  original,
  uid
}) {

  if (
    !current?.sourcePath ||
    !original
  ) {
    throw new Error(
      'The original hymn could not be restored.'
    )
  }


  await createHymnRevision({
    sourceType:
      'built-in',
    sourcePath:
      current.sourcePath,
    hymnType:
      current.type,
    urduTitle:
      current.urduTitle,
    romanTitle:
      current.romanTitle,
    content:
      current.content,
    uid,
    reason:
      'before-restore-original'
  })


  await FirebaseFirestore.deleteDocument({
    reference:
      `${COLLECTION}/${getEditId(
        current.sourcePath
      )}`
  })


  return {
    ...original
  }
}


export function getEditId(
  sourcePath
) {

  return encodeURIComponent(
    normalizePath(sourcePath)
  )
}


function normalizePath(
  value
) {

  const path =
    String(value || '')
      .trim()


  if (!path) {
    return ''
  }


  return path.startsWith('/')
    ? path
    : `/${path}`
}


function normalizeContent(
  value
) {

  return String(value || '')
    .replace(
      /\r\n?/g,
      '\n'
    )
    .trim()
}
