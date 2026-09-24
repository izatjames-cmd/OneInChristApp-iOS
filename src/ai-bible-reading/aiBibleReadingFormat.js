/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingFormat.js
 *
 * Purpose:
 * Provides display helpers for AI Bible Reading content.
 * ============================================================
 */

export function createBibleReadingReferenceMarkup({
  reference,
  language
}) {

  if (language !== 'urdu') {

    return escapeHtml(
      reference
    )
  }


  const match =
    String(
      reference || ''
    )
      .trim()
      .match(
        /^(.+?)\s+([0-9۰-۹٠-٩]+)[:：]([0-9۰-۹٠-٩]+(?:[-–][0-9۰-۹٠-٩]+)?)$/
      )


  if (!match) {

    return escapeHtml(
      reference
    )
  }


  return `<span dir="rtl" style="direction:rtl; unicode-bidi:isolate; word-spacing:8px">${escapeHtml(match[1])} <bdi dir="ltr" style="unicode-bidi:isolate">${escapeHtml(toUrduDigits(match[2]))}</bdi>:<bdi dir="ltr" style="unicode-bidi:isolate">${escapeHtml(toUrduRange(match[3]))}</bdi></span>`
}

function toUrduDigits(value) {
  return String(value).replace(/[0-9]/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])
}

function toUrduRange(value) {
  return toUrduDigits(String(value).replace(/[-–]/g, '–'))
}


export function escapeHtml(
  input
) {

  return String(
    input || ''
  )
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
