/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Daily Devotion
 * File   : dailyDevotionUI.js
 *
 * Purpose:
 * Displays the church-wide Daily Devotion.
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
  createDailyDevotionShell
} from './dailyDevotionShell.js'

import {
  renderDailyDevotionAdmin
} from './dailyDevotionAdmin.js'

import {
  canManageDailyDevotion
} from './dailyDevotionPermissions.js'

import {
  getPublishedDailyDevotions
} from './dailyDevotionStore.js'

import {
  createVerseReferenceMarkup
} from './dailyDevotionFormat.js'


import {
  applyDailyDevotionVocabulary
} from './dailyDevotionVocabulary.js'


let currentUser =
  null

let currentMember =
  null

let currentAdminAccess =
  null


export async function openDailyDevotionSection(
  initialTab = 'devotion'
) {

  let overlay =
    document.getElementById(
      'daily-devotion-overlay'
    )


  if (!overlay) {

    overlay =
      document.createElement(
        'div'
      )

    overlay.id =
      'daily-devotion-overlay'

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
          max-width:520px;
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
          id="close-daily-devotion-top-button"
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

        <div id="daily-devotion-shell"></div>

        <button
          id="close-daily-devotion-button"
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
        'close-daily-devotion-top-button'
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
        'close-daily-devotion-button'
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


  await loadDailyDevotionContext()
  renderDailyDevotionShell()
  await showDailyDevotionTab(
    initialTab
  )
}


export async function renderDailyDevotion(
  container,
  devotion = null
) {

  const approvedDevotions =
    (
      devotion
        ? [devotion]
        : await getPublishedDailyDevotions()
    ).map(
      applyDailyDevotionVocabulary
    )


  if (!approvedDevotions.length) {

    container.innerHTML = `
      <section class="daily-devotion">
        <p>No Daily Devotion has been approved yet.</p>
      </section>
    `

    return
  }


  container.innerHTML =
    createDailyDevotionsMarkup(
      approvedDevotions
    )

  bindDailyDevotionLanguageButtons(
    container
  )
}


export function createDailyDevotionSummary(
  devotion
) {

  if (!devotion) {
    return '<p>No devotion has been approved yet.</p>'
  }


  return `
    <p><strong>${escapeHtml(
      devotion.verseReference || 'Bible Verse'
    )}</strong></p>
    <p>${escapeHtml(devotion.verseText)}</p>
    <button type="button" data-youth-tab="devotion">
      Read Devotion
    </button>
  `
}


function createDailyDevotionsMarkup(
  devotions
) {

  return `
    <section class="daily-devotion">
      ${devotions.map(
        devotion => createDailyDevotionMarkup(
          devotion
        )
      ).join('')}
    </section>
  `
}


function createDailyDevotionMarkup(
  devotion
) {

  const hasDanish =
    hasDevotionTranslation(
      devotion,
      'danish'
    )

  const hasUrdu =
    hasDevotionTranslation(
      devotion,
      'urdu'
    )


  return `
    <article class="devotion-card dashboard-card">
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:14px;">
        <button
          type="button"
          data-devotion-language-button="english"
        >
          English
        </button>

        <button
          type="button"
          data-devotion-language-button="danish"
          ${hasDanish ? '' : 'disabled'}
        >
          Dansk
        </button>

        <button
          type="button"
          data-devotion-language-button="urdu"
          ${hasUrdu ? '' : 'disabled'}
        >
          اردو
        </button>
      </div>

      ${createDailyDevotionLanguageMarkup({
        devotion,
        language:
          'english',
        label:
          'Bible Verse',
        content:
          devotion,
        hidden:
          false
      })}

      ${createDailyDevotionLanguageMarkup({
        devotion,
        language:
          'danish',
        label:
          'Bibelvers',
        content:
          devotion.translations
            ?.danish,
        hidden:
          true
      })}

      ${createDailyDevotionLanguageMarkup({
        devotion,
        language:
          'urdu',
        label:
          'بائبل کی آیت',
        content:
          devotion.translations
            ?.urdu,
        hidden:
          true
      })}
    </article>
  `
}


function createDailyDevotionLanguageMarkup({
  language,
  label,
  content,
  hidden
}) {

  if (!content) {
    return ''
  }


  const isUrdu =
    language === 'urdu'

  const explanationHeading =
    isUrdu
      ? 'وضاحت'
      : 'Explanation'

  const applicationHeading =
    isUrdu
      ? 'یسوع کیا کرتے؟'
      : language === 'danish'
        ? 'Hvad ville Jesus gøre?'
        : 'What Would Jesus Do?'

  const prayerHeading =
    isUrdu
      ? 'دعا'
      : language === 'danish'
        ? 'Bøn'
        : 'Prayer'


  return `
    <div
      data-devotion-language="${language}"
      ${hidden ? 'hidden' : ''}
      style="${
        isUrdu
          ? "direction:rtl; text-align:right; padding:0 14px; box-sizing:border-box; font-family:'Jameel Noori Nastaliq', serif; font-size:19px; line-height:2;"
          : 'padding:0 14px; box-sizing:border-box;'
      }"
    >
      <section class="devotion-section">
        <h3>${label}</h3>
        <p><strong>${createVerseReferenceMarkup({
          reference:
            content.verseReference,
          language
        })}</strong></p>
        <p>${escapeHtml(content.verseText)}</p>
      </section>

      <section class="devotion-section">
        <h3>${explanationHeading}</h3>
        <p>${escapeHtml(content.explanation)}</p>
      </section>

      <section class="devotion-section">
        <h3>${applicationHeading}</h3>
        <p>${escapeHtml(content.application)}</p>
      </section>

      <section class="devotion-section">
        <h3>${prayerHeading}</h3>
        <p>${escapeHtml(content.prayer)}</p>
      </section>
    </div>
  `
}


function bindDailyDevotionLanguageButtons(
  container
) {

  container
    .querySelectorAll(
      '.devotion-card'
    )
    .forEach(
      card => {

        card
          .querySelectorAll(
            '[data-devotion-language-button]'
          )
          .forEach(
            button => {

              button.addEventListener(
                'click',
                () => {

                  const language =
                    button.dataset.devotionLanguageButton


                  card
                    .querySelectorAll(
                      '[data-devotion-language]'
                    )
                    .forEach(
                      section => {
                        section.hidden =
                          section.dataset.devotionLanguage !==
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


function hasDevotionTranslation(
  devotion,
  language
) {

  const translation =
    devotion.translations?.[language]


  return Boolean(
    translation?.verseReference ||
    translation?.verseText ||
    translation?.explanation ||
    translation?.application ||
    translation?.prayer
  )
}


async function loadDailyDevotionContext() {

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


function renderDailyDevotionShell() {

  const shell =
    document.getElementById(
      'daily-devotion-shell'
    )

  shell.innerHTML =
    createDailyDevotionShell(
      canManageCurrentDailyDevotion()
    )

  bindDailyDevotionTabs(shell)
}


async function showDailyDevotionTab(
  tab
) {

  const container =
    document.getElementById(
      'daily-devotion-content'
    )

  if (!container) {
    return
  }


  container.innerHTML =
    '<p>Loading Daily Devotion...</p>'


  try {

    if (
      tab === 'admin' &&
      canManageCurrentDailyDevotion()
    ) {
      await renderDailyDevotionAdmin({
        container,
        user:
          currentUser,
        member:
          currentMember,
        adminAccess:
          currentAdminAccess,
        onRefresh:
          async () => showDailyDevotionTab('admin')
      })
    } else {
      await renderDailyDevotion(container)
    }


    bindDailyDevotionTabs(
      document.getElementById(
        'daily-devotion-shell'
      )
    )

  } catch (error) {

    console.error(
      'Unable to load Daily Devotion:',
      error
    )

    container.innerHTML =
      '<p>Unable to load Daily Devotion.</p>'
  }
}


function bindDailyDevotionTabs(
  container
) {

  container
    ?.querySelectorAll(
      '[data-daily-devotion-tab]'
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
            await showDailyDevotionTab(
              button.dataset.dailyDevotionTab
            )
          }
        )
      }
    )
}


function canManageCurrentDailyDevotion() {

  return canManageDailyDevotion(
    currentMember,
    currentAdminAccess
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
