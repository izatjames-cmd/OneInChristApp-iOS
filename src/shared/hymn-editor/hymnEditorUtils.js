import {
  getCurrentMember
} from '../../auth/phoneAuth.js'


export async function requireCurrentUser() {

  const user =
    await getCurrentMember()


  if (!user?.uid) {
    throw new Error(
      'Please sign in again.'
    )
  }


  return user
}


export function normalizeComparableData(
  data
) {

  return {
    type:
      data?.type ||
      'geet',
    urduTitle:
      String(
        data?.urduTitle || ''
      ).trim(),
    romanTitle:
      String(
        data?.romanTitle || ''
      ).trim(),
    content:
      normalizeContent(
        data?.content
      ),
    sourcePath:
      String(
        data?.sourcePath || ''
      ).trim()
  }
}


export function normalizeContent(
  value
) {

  return String(value || '')
    .replace(
      /\r\n?/g,
      '\n'
    )
    .trim()
}


export function formatRevisionDate(
  value
) {

  const date =
    new Date(
      value || ''
    )


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'Earlier version'
  }


  return date.toLocaleString()
}


export function escapeHtml(
  value
) {

  return String(
    value ?? ''
  )
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}


export function escapeAttribute(
  value
) {
  return escapeHtml(
    value
  )
}
