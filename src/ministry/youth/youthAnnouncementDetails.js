/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Youth
 * File   : youthAnnouncementDetails.js
 *
 * Purpose:
 * Displays a youth announcement detail popup.
 * ============================================================
 */

export function showYouthAnnouncementDetails(
  announcement
) {

  const overlay =
    document.createElement(
      'div'
    )


  overlay.style.position =
    'fixed'

  overlay.style.inset =
    '0'

  overlay.style.zIndex =
    '110000'

  overlay.style.background =
    'rgba(0,0,0,.55)'

  overlay.style.display =
    'flex'

  overlay.style.alignItems =
    'center'

  overlay.style.justifyContent =
    'center'

  overlay.style.padding =
    '20px'


  overlay.innerHTML = `
    <article
      style="
        width:100%;
        max-width:430px;
        max-height:85vh;
        overflow-y:auto;
        background:#fffdf8;
        border-radius:12px;
        padding:20px;
        box-sizing:border-box;
        font-family:Arial,sans-serif;
      "
    >
      <h2 style="margin-top:0;">
        ${escapeHtml(
          announcement.title ||
          'Youth Announcement'
        )}
      </h2>

      <p style="white-space:pre-wrap;">
        ${escapeHtml(
          announcement.message
        )}
      </p>

      <button
        type="button"
        data-close-youth-announcement
        style="
          width:100%;
          padding:12px;
          margin-top:12px;
        "
      >
        Close
      </button>
    </article>
  `


  overlay
    .querySelector(
      '[data-close-youth-announcement]'
    )
    .addEventListener(
      'click',
      () => {

        overlay.remove()
      }
    )


  document.body.appendChild(
    overlay
  )
}


function escapeHtml(
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
