/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingUI.js
 *
 * Purpose:
 * Displays the church-wide AI Bible Reading.
 * ============================================================
 */

import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  getApprovedMember
} from '../auth/appState.js'

import {
  getAdminAccess
} from '../auth/adminAccessStore.js'

import {
  returnToMemberArea
} from '../members/memberNavigation.js'

import {
  createAiBibleReadingShell
} from './aiBibleReadingShell.js'

import {
  renderAiBibleReadingAdmin
} from './aiBibleReadingAdmin.js'

import {
  canManageAiBibleReading
} from './aiBibleReadingPermissions.js'

import {
  getPublishedAiBibleReadings
} from './aiBibleReadingStore.js'

import {
  createBibleReadingReferenceMarkup,
  escapeHtml
} from './aiBibleReadingFormat.js'


import {
  applyAiBibleReadingVocabulary
} from './aiBibleReadingVocabulary.js'


let currentUser =
  null

let currentMember =
  null

let currentAdminAccess =
  null


export async function openAiBibleReadingSection(
  initialTab = 'reading'
) {

  let overlay =
    document.getElementById(
      'ai-bible-reading-overlay'
    )


  if (!overlay) {

    overlay =
      document.createElement(
        'div'
      )

    overlay.id =
      'ai-bible-reading-overlay'

    overlay.style.position =
      'fixed'
    overlay.style.inset =
      '0'
    overlay.style.background =
      'rgba(0,0,0,.55)'
    overlay.style.zIndex =
      '100000'
    overlay.style.display =
      'flex'
    overlay.style.alignItems =
      'center'
    overlay.style.justifyContent =
      'center'
    overlay.style.padding =
      '20px'

    overlay.innerHTML = `
      <div
        style="
          width:100%;
          max-width:560px;
          max-height:90vh;
          overflow-y:auto;
          background:#fffdf8;
          border-radius:12px;
          padding:22px;
          box-sizing:border-box;
          font-family:Arial,sans-serif;
        "
      >
        <button
          id="close-ai-bible-reading-top-button"
          type="button"
          style="
            float:right;
            padding:7px 10px;
            margin-bottom:10px;
            line-height:1;
          "
        >
          Close
        </button>

        <div id="ai-bible-reading-shell"></div>

        <button
          id="close-ai-bible-reading-button"
          type="button"
          style="
            width:100%;
            margin-top:20px;
            padding:12px;
          "
        >
          Close
        </button>
      </div>
    `

    document.body.appendChild(
      overlay
    )

    document
      .getElementById(
        'close-ai-bible-reading-top-button'
      )
      .addEventListener(
        'click',
        () => {
          overlay.style.display =
            'none'

          returnToMemberArea()
        }
      )


    document
      .getElementById(
        'close-ai-bible-reading-button'
      )
      .addEventListener(
        'click',
        () => {
          overlay.style.display =
            'none'

          returnToMemberArea()
        }
      )

  } else {

    overlay.style.display =
      'flex'
  }


  await loadAiBibleReadingContext()
  renderAiBibleReadingShell()
  await showAiBibleReadingTab(
    initialTab
  )
}


export async function renderAiBibleReading(
  container,
  reading = null
) {

  const readings =
    (
      reading
        ? [reading]
        : (await getPublishedAiBibleReadings())
            .filter(
              isTodayReading
            )
            .slice(
              0,
              1
            )
    ).map(
      applyAiBibleReadingVocabulary
    )


  if (!readings.length) {

    container.innerHTML = `
      <section class="ai-bible-reading">
        <p>No Bible Reading has been approved yet.</p>
      </section>
    `

    return
  }


  container.innerHTML =
    createAiBibleReadingsMarkup(
      readings
    )

  bindAiBibleReadingLanguageButtons(
    container
  )
}


function isTodayReading(
  reading
) {

  return reading?.date ===
    new Date()
      .toISOString()
      .slice(0, 10)
}


function createAiBibleReadingsMarkup(
  readings
) {

  return `
    <section class="ai-bible-reading">
      ${readings.map(
        reading => createAiBibleReadingMarkup(
          reading
        )
      ).join('')}
    </section>
  `
}


function createAiBibleReadingMarkup(
  reading
) {

  return `
    <article
      class="dashboard-card"
      style="
        background:#fffaf0;
        border:1px solid #eadfc8;
        box-shadow:0 8px 24px rgba(0,0,0,.08);
      "
    >
      <p style="color:#6b5a3a; margin-top:0;">
        ${escapeHtml(reading.date || '')}
      </p>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:14px;">
        <button type="button" data-ai-bible-reading-language-button="english">
          English
        </button>

        <button type="button" data-ai-bible-reading-language-button="danish">
          Dansk
        </button>

        <button type="button" data-ai-bible-reading-language-button="urdu">
          اردو
        </button>
      </div>

      ${createAiBibleReadingLanguageMarkup({
        language:
          'english',
        content:
          reading,
        hidden:
          false
      })}

      ${createAiBibleReadingLanguageMarkup({
        language:
          'danish',
        content:
          reading.translations?.danish,
        hidden:
          true
      })}

      ${createAiBibleReadingLanguageMarkup({
        language:
          'urdu',
        content:
          reading.translations?.urdu,
        hidden:
          true
      })}
    </article>
  `
}


function createAiBibleReadingLanguageMarkup({
  language,
  content,
  hidden
}) {

  if (!content) {
    return ''
  }


  const isUrdu =
    language === 'urdu'

  const passageHeading =
    isUrdu
      ? 'بائبل مقدس سے پڑھائی'
      : language === 'danish'
        ? 'Bibellæsning'
        : 'Bible Reading'

  const reflectionHeading =
    isUrdu
      ? 'غور و فکر'
      : language === 'danish'
        ? 'Eftertanke'
        : 'Reflection'

  const questionsHeading =
    isUrdu
      ? 'سوچنے کے سوالات'
      : language === 'danish'
        ? 'Spørgsmål til eftertanke'
        : 'Questions For Reflection'


  return `
    <div
      data-ai-bible-reading-language="${language}"
      ${hidden ? 'hidden' : ''}
      style="${
        isUrdu
          ? "direction:rtl; text-align:right; padding:0 14px; box-sizing:border-box; font-family:'Jameel Noori Nastaliq', serif; font-size:19px; line-height:2;"
          : 'line-height:1.65; padding:0 14px; box-sizing:border-box;'
      }"
    >
      <section>
        <h3>${passageHeading}</h3>
        <p><strong>${createBibleReadingReferenceMarkup({
          reference:
            content.verseReference,
          language
        })}</strong></p>
        <p>${escapeHtml(content.verseText)}</p>
      </section>

      <section>
        <h3>${reflectionHeading}</h3>
        <p>${escapeHtml(content.reflection)}</p>
      </section>

      <section>
        <h3>${questionsHeading}</h3>
        <ul style="${
          isUrdu
            ? 'padding-right:22px; padding-left:0;'
            : ''
        }">
          ${(content.questions || []).map(
            question => `<li>${escapeHtml(question)}</li>`
          ).join('')}
        </ul>
      </section>
    </div>
  `
}


function bindAiBibleReadingLanguageButtons(
  container
) {

  container
    .querySelectorAll(
      '.dashboard-card'
    )
    .forEach(
      card => {

        card
          .querySelectorAll(
            '[data-ai-bible-reading-language-button]'
          )
          .forEach(
            button => {

              button.addEventListener(
                'click',
                () => {

                  const language =
                    button.dataset.aiBibleReadingLanguageButton


                  card
                    .querySelectorAll(
                      '[data-ai-bible-reading-language]'
                    )
                    .forEach(
                      section => {
                        section.hidden =
                          section.dataset.aiBibleReadingLanguage !==
                          language
                      }
                    )
                }
              )
            }
          )
      }
    )
}


async function loadAiBibleReadingContext() {

  currentUser =
    await getCurrentMember()

  currentMember =
    getApprovedMember()

  currentAdminAccess =
    currentUser?.uid
      ? await getAdminAccess(
          currentUser.uid
        )
      : null
}


function renderAiBibleReadingShell() {

  const shell =
    document.getElementById(
      'ai-bible-reading-shell'
    )

  shell.innerHTML =
    createAiBibleReadingShell(
      canManageCurrentAiBibleReading()
    )

  bindAiBibleReadingTabs(shell)
}


async function showAiBibleReadingTab(
  tab
) {

  const container =
    document.getElementById(
      'ai-bible-reading-content'
    )

  if (!container) {
    return
  }


  container.innerHTML =
    '<p>Loading Bible Reading...</p>'


  try {

    if (
      tab === 'admin' &&
      canManageCurrentAiBibleReading()
    ) {
      await renderAiBibleReadingAdmin({
        container,
        user:
          currentUser,
        member:
          currentMember,
        adminAccess:
          currentAdminAccess,
        onRefresh:
          async () => showAiBibleReadingTab('admin')
      })
    } else {
      await renderAiBibleReading(container)
    }


    bindAiBibleReadingTabs(
      document.getElementById(
        'ai-bible-reading-shell'
      )
    )

  } catch (error) {

    console.error(
      'Unable to load Bible Reading:',
      error
    )

    container.innerHTML =
      '<p>Unable to load Bible Reading.</p>'
  }
}


function bindAiBibleReadingTabs(
  container
) {

  container
    ?.querySelectorAll(
      '[data-ai-bible-reading-tab]'
    )
    .forEach(
      button => {

        if (
          button.dataset.bound ===
          'true'
        ) {
          return
        }

        button.dataset.bound =
          'true'

        button.addEventListener(
          'click',
          async () => {
            await showAiBibleReadingTab(
              button.dataset.aiBibleReadingTab
            )
          }
        )
      }
    )
}


function canManageCurrentAiBibleReading() {

  return canManageAiBibleReading(
    currentMember,
    currentAdminAccess
  )
}
