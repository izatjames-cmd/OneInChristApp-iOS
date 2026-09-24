import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'


const COLLECTION =
  'hymnbookRevisions'


export function getHymnRevisionKey({
  sourceType,
  sourcePath = '',
  sourceId = ''
}) {

  if (
    sourceType ===
      'built-in'
  ) {
    return `builtin:${normalizePath(sourcePath)}`
  }


  return `admin:${String(sourceId || '').trim()}`
}


export async function createHymnRevision({
  sourceType,
  sourcePath = '',
  sourceId = '',
  hymnType = 'geet',
  urduTitle = '',
  romanTitle = '',
  content = '',
  uid = '',
  reason = 'edit'
}) {

  const hymnKey =
    getHymnRevisionKey({
      sourceType,
      sourcePath,
      sourceId
    })


  if (
    !hymnKey ||
    hymnKey.endsWith(':')
  ) {
    return
  }


  const now =
    new Date()
      .toISOString()

  const id =
    `REV_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`


  await FirebaseFirestore.setDocument({
    reference:
      `${COLLECTION}/${id}`,

    data: {
      hymnKey,
      sourceType:
        String(sourceType || ''),
      sourcePath:
        normalizePath(sourcePath),
      sourceId:
        String(sourceId || ''),
      hymnType:
        hymnType === 'zaboor'
          ? 'zaboor'
          : 'geet',
      urduTitle:
        String(urduTitle || '').trim(),
      romanTitle:
        String(romanTitle || '').trim(),
      content:
        normalizeContent(content),
      reason:
        String(reason || 'edit'),
      savedBy:
        String(uid || ''),
      savedAt:
        now
    },

    merge:
      false
  })
}


export async function getHymnRevisions({
  sourceType,
  sourcePath = '',
  sourceId = ''
}) {

  const hymnKey =
    getHymnRevisionKey({
      sourceType,
      sourcePath,
      sourceId
    })


  const result =
    await FirebaseFirestore.getCollection({
      reference:
        COLLECTION,

      compositeFilter: {
        type:
          'and',

        queryConstraints: [
          {
            type:
              'where',
            fieldPath:
              'hymnKey',
            opStr:
              '==',
            value:
              hymnKey
          }
        ]
      }
    })


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
    .sort(
      (
        first,
        second
      ) =>
        String(
          second?.savedAt || ''
        ).localeCompare(
          String(
            first?.savedAt || ''
          )
        )
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
