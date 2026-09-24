import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  getLiveSermonSpeechToken
} from './liveSermonSpeechService.js'

import {
  addLiveSermonSegment,
  deleteLiveSermonChat,
  startLiveSermonSession,
  stopLiveSermonSession,
  subscribeLiveSermonSegments,
  subscribeLiveSermonSession,
  touchLiveSermonSession
} from './liveSermonStore.js'


import {
  getChurchSpeechPhrases,
  normalizeChurchTerminology,
  refreshLearnedChurchVocabulary
} from '../shared/church-vocabulary/churchVocabulary.js'

import {
  openVocabularyReview
} from './vocabulary-learning/vocabularyReviewUI.js'

import {
  applyContextualGrammar,
  createSermonContext
} from './context/index.js'


const SPEECH_SDK_URL =
  'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@1.51.0/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js'


const LANGUAGES = {
  danish: {
    key:
      'danish',
    label:
      'Danish',
    sourceLocale:
      'da-DK',
    targetCode:
      'da',
    direction:
      'ltr'
  },

  english: {
    key:
      'english',
    label:
      'English',
    sourceLocale:
      'en-GB',
    targetCode:
      'en',
    direction:
      'ltr'
  },

  urdu: {
    key:
      'urdu',
    label:
      '\u0627\u0631\u062F\u0648',
    sourceLocale:
      'ur-IN',
    targetCode:
      'ur',
    direction:
      'rtl'
  }
}


let speechSdkPromise =
  null

let activeRecognizer =
  null

let activeHostPlanId =
  ''

let activeHostSessionId =
  ''

let activeHostSourceLanguage =
  ''

let hostStopping =
  false

let tokenRefreshTimer =
  null

let heartbeatTimer =
  null

let hostSequenceCounter =
  0

const activeSermonContext =
  createSermonContext({
    historyLimit:
      5,
    focusMaxAge:
      4
  })

let screenWakeLock =
  null

let overlaySessionUnsubscribe =
  null

let overlaySegmentsUnsubscribe =
  null

let overlayPlan =
  null

let overlayIsTranslationAdmin =
  false

let overlaySelectedLanguage =
  ''

let overlayCurrentSession =
  null

let overlayCurrentSegments =
  []

const buttonUnsubscribers =
  new Set()


export async function clearLiveSermonStatusListeners() {

  const listeners =
    Array.from(
      buttonUnsubscribers
    )


  buttonUnsubscribers.clear()


  await Promise.allSettled(
    listeners.map(
      unsubscribe =>
        unsubscribe?.()
    )
  )
}


export async function bindLiveSermonStatusButton(
  button,
  {
    planId,
    canViewLiveTranslation = true
  }
) {

  if (
    !button ||
    !planId
  ) {
    return
  }


  setLiveButtonState(
    button,
    false
  )


  if (!canViewLiveTranslation) {
    return
  }


  try {

    const unsubscribe =
      await subscribeLiveSermonSession(
        planId,
        session => {

          setLiveButtonState(
            button,
            session?.active ===
              true
          )
        },
        error => {

          console.warn(
            'Unable to watch Live Translation status:',
            error
          )
        }
      )


    buttonUnsubscribers.add(
      unsubscribe
    )

  } catch (error) {

    console.warn(
      'Unable to start Live Translation status listener:',
      error
    )
  }
}


export async function openLiveSermonTranslation({
  plan,
  isTranslationAdmin = false,
  canViewLiveTranslation = true
}) {

  if (!plan?.id) {
    return
  }


  if (!canViewLiveTranslation) {

    alert(
      'Please sign in as a church member to use Live Translation.'
    )

    return
  }


  const user =
    await getCurrentMember()


  if (!user?.uid) {

    alert(
      'Please sign in as a church member to use Live Translation.'
    )

    return
  }


  overlayPlan =
    plan

  overlayIsTranslationAdmin =
    isTranslationAdmin ===
    true

  overlaySelectedLanguage =
    ''

  overlayCurrentSession =
    null

  overlayCurrentSegments =
    []


  const overlay =
    ensureOverlay()


  overlay.style.display =
    'block'


  const title =
    overlay.querySelector(
      '#live-sermon-plan-title'
    )


  if (title) {

    title.textContent =
      plan.sermon?.title ||
      plan.title ||
      'Sermon'
  }


  renderOverlay()


  await stopOverlayListeners()


  try {

    overlaySessionUnsubscribe =
      await subscribeLiveSermonSession(
        plan.id,
        async session => {

          const previousSessionId =
            overlayCurrentSession?.sessionId ||
            ''


          overlayCurrentSession =
            session


          const nextSessionId =
            session?.sessionId ||
            ''


          if (
            previousSessionId !==
            nextSessionId
          ) {

            overlayCurrentSegments =
              []


            await stopOverlaySegmentsListener()


            if (nextSessionId) {

              overlaySegmentsUnsubscribe =
                await subscribeLiveSermonSegments(
                  plan.id,
                  nextSessionId,
                  segments => {

                    overlayCurrentSegments =
                      segments

                    renderTranscript()
                  },
                  error => {

                    console.error(
                      'Unable to load live sermon text:',
                      error
                    )
                  }
                )
            }
          }


          normalizeSelectedLanguage()
          renderOverlay()
        },
        error => {

          console.error(
            'Unable to load Live Translation session:',
            error
          )

          setOverlayMessage(
            'Unable to load Live Translation.'
          )
        }
      )

  } catch (error) {

    console.error(
      'Unable to open Live Translation:',
      error
    )

    setOverlayMessage(
      'Unable to open Live Translation.'
    )
  }
}


function ensureOverlay() {

  let overlay =
    document.querySelector(
      '#live-sermon-translation-overlay'
    )


  if (overlay) {
    return overlay
  }


  overlay =
    document.createElement(
      'div'
    )


  overlay.id =
    'live-sermon-translation-overlay'

  overlay.style.position =
    'fixed'

  overlay.style.inset =
    '0'

  overlay.style.zIndex =
    '70000'

  overlay.style.background =
    '#fffdf8'

  overlay.style.overflow =
    'auto'

  overlay.style.display =
    'none'


  overlay.innerHTML = `
    <div
      style="
        max-width:760px;
        margin:0 auto;
        padding:16px;
        box-sizing:border-box;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:12px;
          margin-bottom:14px;
        "
      >

        <div>
          <h2 style="margin:0 0 4px 0;">
            Live Sermon Translation
          </h2>

          <div
            id="live-sermon-plan-title"
            style="font-weight:600;"
          ></div>
        </div>

        <button
          id="close-live-sermon-translation-button"
          type="button"
          style="padding:9px 12px;"
        >
          Close
        </button>

      </div>

      <div
        id="live-sermon-status-card"
        style="
          border:1px solid #dedbd5;
          border-radius:12px;
          padding:12px;
          margin-bottom:14px;
          background:#ffffff;
        "
      ></div>

      <div
        id="live-sermon-admin-controls"
      ></div>

      <div
        id="live-sermon-language-controls"
        style="margin:14px 0;"
      ></div>

      <div
        id="live-sermon-interim"
        style="
          display:none;
          padding:10px;
          margin-bottom:10px;
          border-radius:10px;
          background:#f5f3ef;
          color:#555555;
        "
      ></div>

      <div
        id="live-sermon-transcript"
        style="
          min-height:220px;
          border:1px solid #dedbd5;
          border-radius:12px;
          padding:14px;
          background:#ffffff;
        "
      ></div>

      <p
        style="
          margin:12px 2px 0 2px;
          font-size:13px;
          color:#666666;
        "
      >
        Live translation is generated automatically and may contain errors.
      </p>

    </div>
  `


  document.body.appendChild(
    overlay
  )


  overlay
    .querySelector(
      '#close-live-sermon-translation-button'
    )
    ?.addEventListener(
      'click',
      async () => {

        overlay.style.display =
          'none'

        await stopOverlayListeners()
      }
    )


  return overlay
}


function renderOverlay() {

  const overlay =
    document.querySelector(
      '#live-sermon-translation-overlay'
    )


  if (!overlay) {
    return
  }


  renderStatus()
  renderAdminControls()
  renderLanguageControls()
  renderTranscript()
}


function renderStatus() {

  const container =
    document.querySelector(
      '#live-sermon-status-card'
    )


  if (!container) {
    return
  }


  const session =
    overlayCurrentSession


  if (!session) {

    container.innerHTML = `
      <strong>Live translation not started</strong>
      <div style="margin-top:4px;color:#666666;">
        The sermon translation will appear here when an admin starts it.
      </div>
    `

    return
  }


  const source =
    getLanguage(
      session.sourceLanguage
    )


  if (
    session.active ===
    true
  ) {

    container.innerHTML = `
      <div
        style="
          display:flex;
          align-items:center;
          gap:8px;
          font-weight:700;
          color:#a61b14;
        "
      >
        <span>🔴</span>
        <span>LIVE</span>
      </div>

      <div style="margin-top:6px;">
        Sermon language:
        <strong>${escapeHtml(source.label)}</strong>
      </div>
    `

    return
  }


  container.innerHTML = `
    <strong>Live translation ended</strong>
    <div style="margin-top:4px;color:#666666;">
      Sermon language: ${escapeHtml(source.label)}
    </div>
  `
}


function renderAdminControls() {

  const container =
    document.querySelector(
      '#live-sermon-admin-controls'
    )


  if (!container) {
    return
  }


  container.innerHTML =
    ''


  if (!overlayIsTranslationAdmin) {
    return
  }


  const session =
    overlayCurrentSession


  const wrapper =
    document.createElement(
      'div'
    )


  wrapper.style.border =
    '1px solid #dedbd5'

  wrapper.style.borderRadius =
    '12px'

  wrapper.style.padding =
    '12px'

  wrapper.style.background =
    '#ffffff'


  const heading =
    document.createElement(
      'strong'
    )


  heading.textContent =
    'Translation Admin'


  wrapper.appendChild(
    heading
  )


  if (
    session?.active ===
    true
  ) {

    const source =
      getLanguage(
        session.sourceLanguage
      )


    const info =
      document.createElement(
        'div'
      )


    info.style.margin =
      '8px 0 10px 0'

    info.textContent =
      `Currently translating from ${source.label}.`


    const stopButton =
      document.createElement(
        'button'
      )


    stopButton.type =
      'button'

    stopButton.textContent =
      'Stop Live Translation'

    stopButton.style.width =
      '100%'

    stopButton.style.padding =
      '12px'

    stopButton.style.fontWeight =
      '700'

    stopButton.style.background =
      '#b42318'

    stopButton.style.color =
      '#ffffff'

    stopButton.style.border =
      '0'

    stopButton.style.borderRadius =
      '8px'


    stopButton.addEventListener(
      'click',
      async () => {

        stopButton.disabled =
          true

        stopButton.textContent =
          'Stopping...'


        try {

          await stopTranslationForCurrentPlan()

        } catch (error) {

          console.error(
            'Unable to stop Live Translation:',
            error
          )

          alert(
            `Unable to stop Live Translation: ${
              error?.message ||
              error
            }`
          )

          stopButton.disabled =
            false

          stopButton.textContent =
            'Stop Live Translation'
        }
      }
    )


    wrapper.appendChild(
      info
    )

    wrapper.appendChild(
      stopButton
    )

    container.appendChild(
      wrapper
    )

    return
  }


  const label =
    document.createElement(
      'label'
    )


  label.textContent =
    'Spoken sermon language'

  label.style.display =
    'block'

  label.style.marginTop =
    '10px'


  const select =
    document.createElement(
      'select'
    )


  select.id =
    'live-sermon-source-language'

  select.style.width =
    '100%'

  select.style.padding =
    '11px'

  select.style.marginTop =
    '6px'


  ;[
    'danish',
    'english',
    'urdu'
  ].forEach(
    languageKey => {

      const language =
        getLanguage(
          languageKey
        )

      const option =
        document.createElement(
          'option'
        )

      option.value =
        languageKey

      option.textContent =
        language.label

      select.appendChild(
        option
      )
    }
  )


  const targets =
    document.createElement(
      'div'
    )


  targets.id =
    'live-sermon-target-summary'

  targets.style.margin =
    '10px 0'

  targets.style.color =
    '#555555'


  const updateTargetSummary =
    () => {

      const targetLabels =
        getTargetLanguages(
          select.value
        )
          .map(
            key =>
              getLanguage(
                key
              ).label
          )
          .join(
            ' + '
          )


      targets.textContent =
        `Will translate into: ${targetLabels}`
    }


  select.addEventListener(
    'change',
    updateTargetSummary
  )


  updateTargetSummary()


  const startButton =
    document.createElement(
      'button'
    )


  startButton.type =
    'button'

  startButton.textContent =
    'Start Live Translation'

  startButton.style.width =
    '100%'

  startButton.style.padding =
    '12px'

  startButton.style.fontWeight =
    '700'

  startButton.style.borderRadius =
    '8px'


  startButton.addEventListener(
    'click',
    async () => {

      startButton.disabled =
        true

      startButton.textContent =
        'Starting...'

      setInterimText(
        'Connecting to Live Translation...'
      )


      try {

        await startTranslationForCurrentPlan(
          select.value
        )

      } catch (error) {

        console.error(
          'Unable to start Live Translation:',
          error
        )

        setInterimText(
          ''
        )

        alert(
          `Unable to start Live Translation: ${
            error?.message ||
            error
          }`
        )

        startButton.disabled =
          false

        startButton.textContent =
          'Start Live Translation'
      }
    }
  )


  wrapper.appendChild(
    label
  )

  wrapper.appendChild(
    select
  )

  wrapper.appendChild(
    targets
  )

  wrapper.appendChild(
    startButton
  )


  if (
    session?.sessionId &&
    session?.active !== true
  ) {

    const reviewButton =
      document.createElement(
        'button'
      )


    reviewButton.type =
      'button'

    reviewButton.textContent =
      'Review New Church Vocabulary'

    reviewButton.style.width =
      '100%'

    reviewButton.style.padding =
      '12px'

    reviewButton.style.fontWeight =
      '700'

    reviewButton.style.marginTop =
      '14px'


    reviewButton.addEventListener(
      'click',
      async () => {

        reviewButton.disabled =
          true

        reviewButton.textContent =
          'Analyzing Sermon...'


        try {

          await openVocabularyReview({
            planId:
              overlayPlan?.id || '',
            sessionId:
              session.sessionId,
            sourceLanguage:
              session.sourceLanguage,
            segments:
              overlayCurrentSegments
          })

        } catch (error) {

          console.error(
            'Unable to review sermon vocabulary:',
            error
          )

          alert(
            `Unable to review sermon vocabulary: ${error?.message || error}`
          )

        } finally {

          reviewButton.disabled =
            false

          reviewButton.textContent =
            'Review New Church Vocabulary'
        }
      }
    )


    wrapper.appendChild(
      reviewButton
    )


    const deleteDivider =
      document.createElement(
        'div'
      )


    deleteDivider.style.height =
      '1px'

    deleteDivider.style.background =
      '#e6e1da'

    deleteDivider.style.margin =
      '16px 0'


    const deleteInfo =
      document.createElement(
        'div'
      )


    deleteInfo.textContent =
      'The finished Live Translation chat is still saved for members.'

    deleteInfo.style.marginBottom =
      '8px'

    deleteInfo.style.fontSize =
      '14px'

    deleteInfo.style.color =
      '#666666'


    const deleteButton =
      document.createElement(
        'button'
      )


    deleteButton.type =
      'button'

    deleteButton.textContent =
      'Delete Live Translation Chat'

    deleteButton.style.width =
      '100%'

    deleteButton.style.padding =
      '12px'

    deleteButton.style.fontWeight =
      '700'

    deleteButton.style.background =
      '#b42318'

    deleteButton.style.color =
      '#ffffff'

    deleteButton.style.border =
      '0'

    deleteButton.style.borderRadius =
      '8px'


    deleteButton.addEventListener(
      'click',
      async () => {

        const confirmed =
          window.confirm(
            'Delete all saved Live Translation text for this sermon? This cannot be undone.'
          )


        if (!confirmed) {
          return
        }


        deleteButton.disabled =
          true

        deleteButton.textContent =
          'Deleting...'


        try {

          await deleteLiveSermonChat(
            overlayPlan?.id
          )


          overlayCurrentSession =
            null

          overlayCurrentSegments =
            []


          await stopOverlaySegmentsListener()


          setInterimText(
            ''
          )


          renderOverlay()


          alert(
            'Live Translation chat deleted.'
          )

        } catch (error) {

          console.error(
            'Unable to delete Live Translation chat:',
            error
          )

          alert(
            `Unable to delete Live Translation chat: ${
              error?.message ||
              error
            }`
          )

          deleteButton.disabled =
            false

          deleteButton.textContent =
            'Delete Live Translation Chat'
        }
      }
    )


    wrapper.appendChild(
      deleteDivider
    )

    wrapper.appendChild(
      deleteInfo
    )

    wrapper.appendChild(
      deleteButton
    )
  }


  container.appendChild(
    wrapper
  )
}


function renderLanguageControls() {

  const container =
    document.querySelector(
      '#live-sermon-language-controls'
    )


  if (!container) {
    return
  }


  container.innerHTML =
    ''


  const session =
    overlayCurrentSession


  if (
    !session?.sessionId ||
    !session?.sourceLanguage
  ) {
    return
  }


  const targets =
    getSessionTargets(
      session
    )


  if (!targets.length) {
    return
  }


  const heading =
    document.createElement(
      'div'
    )


  heading.textContent =
    'Read translation in:'

  heading.style.fontWeight =
    '600'

  heading.style.marginBottom =
    '8px'


  const buttonRow =
    document.createElement(
      'div'
    )


  buttonRow.style.display =
    'flex'

  buttonRow.style.flexWrap =
    'wrap'

  buttonRow.style.gap =
    '8px'


  targets.forEach(
    languageKey => {

      const language =
        getLanguage(
          languageKey
        )

      const button =
        document.createElement(
          'button'
        )


      button.type =
        'button'

      button.textContent =
        language.label

      button.style.padding =
        '9px 14px'

      button.style.borderRadius =
        '8px'


      if (
        overlaySelectedLanguage ===
        languageKey
      ) {

        button.style.fontWeight =
          '700'

        button.style.border =
          '2px solid #333333'
      }


      button.addEventListener(
        'click',
        () => {

          overlaySelectedLanguage =
            languageKey

          renderLanguageControls()
          renderTranscript()
        }
      )


      buttonRow.appendChild(
        button
      )
    }
  )


  container.appendChild(
    heading
  )

  container.appendChild(
    buttonRow
  )
}


function renderTranscript() {

  const container =
    document.querySelector(
      '#live-sermon-transcript'
    )


  if (!container) {
    return
  }


  container.innerHTML =
    ''


  const session =
    overlayCurrentSession


  if (!session?.sessionId) {

    container.innerHTML = `
      <div style="color:#666666;">
        Live sermon text will appear here.
      </div>
    `

    return
  }


  normalizeSelectedLanguage()


  const language =
    getLanguage(
      overlaySelectedLanguage
    )


  const values =
    [...overlayCurrentSegments]
      .sort(
        (
          a,
          b
        ) =>
          Number(
            a?.sequence ||
            0
          ) -
          Number(
            b?.sequence ||
            0
          )
      )
      .map(
        segment =>
          String(
            segment?.translations?.[
              overlaySelectedLanguage
            ] ||
            ''
          ).trim()
      )
      .filter(
        Boolean
      )


  if (!values.length) {

    container.innerHTML = `
      <div style="color:#666666;">
        ${
          session.active === true
            ? 'Listening for the sermon...'
            : 'No translated text is available for this session.'
        }
      </div>
    `

    return
  }


  container.dir =
    language.direction

  container.style.direction =
    language.direction

  container.style.textAlign =
    language.direction ===
      'rtl'
      ? 'right'
      : 'left'


  if (
    overlaySelectedLanguage ===
    'urdu'
  ) {
    container.classList.add(
      'urdu-text'
    )
    container.style.fontSize =
      '22px'
    container.style.lineHeight =
      '2'
  } else {
    container.classList.remove(
      'urdu-text'
    )
    container.style.fontSize =
      '17px'
    container.style.lineHeight =
      '1.65'
  }


  values.forEach(
    (
      value,
      index
    ) => {

      const line =
        document.createElement(
          'div'
        )


      line.textContent =
        value

      line.style.marginBottom =
        '10px'


      if (
        index ===
        values.length - 1
      ) {
        line.style.fontWeight =
          '700'
      }


      container.appendChild(
        line
      )
    }
  )


  container.style.maxHeight =
    '58vh'

  container.style.overflowY =
    'auto'

  container.style.scrollBehavior =
    'smooth'


  requestAnimationFrame(
    () => {

      container.scrollTop =
        container.scrollHeight
    }
  )
}


async function startTranslationForCurrentPlan(
  sourceLanguage
) {

  const plan =
    overlayPlan


  if (!plan?.id) {
    throw new Error(
      'Service Plan is missing.'
    )
  }


  if (!overlayIsTranslationAdmin) {
    throw new Error(
      'You do not have permission to start Live Translation.'
    )
  }


  const user =
    await getCurrentMember()


  if (!user?.uid) {
    throw new Error(
      'Please sign in again.'
    )
  }


  await startHostTranslation({
    planId:
      plan.id,
    sourceLanguage,
    uid:
      user.uid,
    onInterim:
      text => {
        setInterimText(
          text
        )
      },
    onError:
      message => {
        setInterimText(
          message
        )
      }
  })
}


async function stopTranslationForCurrentPlan() {

  const planId =
    overlayPlan?.id


  if (!planId) {
    return
  }


  if (
    activeHostPlanId ===
      planId &&
    activeHostSessionId
  ) {

    await stopHostTranslation()

  } else {

    await stopLiveSermonSession({
      planId,
      sessionId:
        overlayCurrentSession?.sessionId ||
        ''
    })
  }


  setInterimText(
    ''
  )
}


async function startHostTranslation({
  planId,
  sourceLanguage,
  uid,
  onInterim,
  onError
}) {

  if (
    activeRecognizer ||
    activeHostSessionId
  ) {

    await stopHostTranslation()
  }


  const source =
    getLanguage(
      sourceLanguage
    )

  const targetLanguageKeys =
    getTargetLanguages(
      source.key
    )


  const [
    sdk,
    tokenData
  ] =
    await Promise.all([
      loadSpeechSdk(),
      getLiveSermonSpeechToken()
    ])


  try {
    await refreshLearnedChurchVocabulary()
  } catch (error) {
    console.warn(
      'Unable to refresh learned church vocabulary:',
      error
    )
  }


  await ensureMicrophonePermission()


  const translationConfig =
    sdk.SpeechTranslationConfig
      .fromAuthorizationToken(
        tokenData.token,
        tokenData.region
      )


  translationConfig.speechRecognitionLanguage =
    source.sourceLocale


  targetLanguageKeys.forEach(
    key => {
      translationConfig.addTargetLanguage(
        getLanguage(
          key
        ).targetCode
      )
    }
  )


  const audioConfig =
    sdk.AudioConfig
      .fromDefaultMicrophoneInput()


  const recognizer =
    new sdk.TranslationRecognizer(
      translationConfig,
      audioConfig
    )


  applyChristianPhraseList(
    sdk,
    recognizer,
    source.key
  )


  const sessionId =
    createSessionId()


  activeRecognizer =
    recognizer

  activeHostPlanId =
    planId

  activeHostSessionId =
    sessionId

  activeHostSourceLanguage =
    source.key

  hostSequenceCounter =
    0

  activeSermonContext.reset()

  hostStopping =
    false


  recognizer.recognizing =
    (
      _sender,
      event
    ) => {

      const text =
        String(
          event?.result?.text ||
          ''
        ).trim()


      if (text) {
        onInterim?.(
          text
        )
      }
    }


  recognizer.recognized =
    async (
      _sender,
      event
    ) => {

      try {

        const result =
          event?.result

        const sourceText =
          String(
            result?.text ||
            ''
          ).trim()


        if (!sourceText) {
          return
        }


        const translations = {
          danish:
            '',
          english:
            '',
          urdu:
            ''
        }


        const sermonContext =
          activeSermonContext.observe(
            sourceText,
            source.key
          )


        targetLanguageKeys.forEach(
          key => {

            const targetCode =
              getLanguage(
                key
              ).targetCode

            const rawTranslation =
              String(
                result?.translations?.get?.(
                  targetCode,
                  ''
                ) ||
                ''
              ).trim()

            const grammarAwareTranslation =
              applyContextualGrammar(
                rawTranslation,
                key,
                sermonContext
              )


            translations[key] =
              normalizeChurchTerminology(
                grammarAwareTranslation,
                key,
                {
                  sourceText,
                  sourceLanguage:
                    source.key
                }
              )
          }
        )


        if (
          !targetLanguageKeys.some(
            key =>
              Boolean(
                translations[key]
              )
          )
        ) {
          return
        }


        hostSequenceCounter +=
          1


        const sequence =
          Date.now() *
            1000 +
          (
            hostSequenceCounter %
            1000
          )


        await addLiveSermonSegment({
          planId,
          sessionId,
          sequence,
          sourceLanguage:
            source.key,
          sourceText,
          translations
        })


        onInterim?.(
          ''
        )

      } catch (error) {

        console.error(
          'Unable to publish translated sermon text:',
          error
        )
      }
    }


  recognizer.canceled =
    async (
      _sender,
      event
    ) => {

      if (hostStopping) {
        return
      }


      const details =
        String(
          event?.errorDetails ||
          event?.reason ||
          'Speech translation stopped.'
        )


      console.error(
        'Live sermon translation canceled:',
        details
      )


      onError?.(
        `Live translation stopped: ${details}`
      )


      await markHostSessionStopped()
    }


  try {

    await startLiveSermonSession({
      planId,
      sessionId,
      sourceLanguage:
        source.key,
      targetLanguages:
        targetLanguageKeys,
      uid
    })


    await startRecognizer(
      recognizer
    )


    startTokenRefreshTimer(
      recognizer
    )

    startHeartbeatTimer(
      planId,
      sessionId
    )

    await requestScreenWakeLock()


    onInterim?.(
      'Listening...'
    )

  } catch (error) {

    await markHostSessionStopped()

    throw error
  }
}


async function stopHostTranslation() {

  const recognizer =
    activeRecognizer

  const planId =
    activeHostPlanId

  const sessionId =
    activeHostSessionId


  hostStopping =
    true


  clearHostTimers()

  await releaseScreenWakeLock()


  if (recognizer) {

    try {

      await stopRecognizer(
        recognizer
      )

    } catch (error) {

      console.warn(
        'Speech recognizer did not stop cleanly:',
        error
      )
    }


    try {
      recognizer.close()
    } catch (error) {
      console.warn(
        'Unable to close speech recognizer:',
        error
      )
    }
  }


  if (planId) {

    await stopLiveSermonSession({
      planId,
      sessionId
    })
  }


  resetHostState()
}


async function markHostSessionStopped() {

  const planId =
    activeHostPlanId

  const sessionId =
    activeHostSessionId


  clearHostTimers()

  await releaseScreenWakeLock()


  if (planId) {

    try {
      await stopLiveSermonSession({
        planId,
        sessionId
      })
    } catch (error) {
      console.warn(
        'Unable to mark Live Translation as stopped:',
        error
      )
    }
  }


  try {
    activeRecognizer?.close?.()
  } catch (error) {
    console.warn(
      'Unable to close canceled recognizer:',
      error
    )
  }


  resetHostState()
}


function resetHostState() {

  activeRecognizer =
    null

  activeHostPlanId =
    ''

  activeHostSessionId =
    ''

  activeHostSourceLanguage =
    ''

  hostStopping =
    false

  hostSequenceCounter =
    0

  activeSermonContext.reset()
}


function clearHostTimers() {

  if (tokenRefreshTimer) {
    clearInterval(
      tokenRefreshTimer
    )
    tokenRefreshTimer =
      null
  }


  if (heartbeatTimer) {
    clearInterval(
      heartbeatTimer
    )
    heartbeatTimer =
      null
  }
}


function startTokenRefreshTimer(
  recognizer
) {

  if (tokenRefreshTimer) {
    clearInterval(
      tokenRefreshTimer
    )
  }


  tokenRefreshTimer =
    setInterval(
      async () => {

        try {

          const tokenData =
            await getLiveSermonSpeechToken()


          if (
            activeRecognizer ===
              recognizer &&
            tokenData?.token
          ) {

            recognizer.authorizationToken =
              tokenData.token
          }

        } catch (error) {

          console.warn(
            'Unable to refresh Live Translation token:',
            error
          )
        }
      },
      8 *
        60 *
        1000
    )
}


function startHeartbeatTimer(
  planId,
  sessionId
) {

  if (heartbeatTimer) {
    clearInterval(
      heartbeatTimer
    )
  }


  heartbeatTimer =
    setInterval(
      async () => {

        try {
          await touchLiveSermonSession(
            planId,
            sessionId
          )
        } catch (error) {
          console.warn(
            'Unable to update Live Translation heartbeat:',
            error
          )
        }
      },
      30 *
        1000
    )
}


async function requestScreenWakeLock() {

  if (
    !navigator?.wakeLock?.request
  ) {
    return
  }


  try {

    screenWakeLock =
      await navigator.wakeLock.request(
        'screen'
      )

  } catch (error) {

    console.warn(
      'Unable to keep the screen awake during Live Translation:',
      error
    )
  }
}


async function releaseScreenWakeLock() {

  if (!screenWakeLock) {
    return
  }


  try {
    await screenWakeLock.release()
  } catch (error) {
    console.warn(
      'Unable to release screen wake lock:',
      error
    )
  }


  screenWakeLock =
    null
}


async function ensureMicrophonePermission() {

  if (
    !navigator?.mediaDevices?.getUserMedia
  ) {

    throw new Error(
      'Microphone access is not available on this device.'
    )
  }


  let stream


  try {

    stream =
      await navigator.mediaDevices
        .getUserMedia({
          audio:
            true
        })

  } catch (error) {

    throw new Error(
      'Microphone permission is required for Live Translation.'
    )
  } finally {

    stream
      ?.getTracks?.()
      ?.forEach(
        track =>
          track.stop()
      )
  }
}


function loadSpeechSdk() {

  if (
    window.SpeechSDK
  ) {
    return Promise.resolve(
      window.SpeechSDK
    )
  }


  if (speechSdkPromise) {
    return speechSdkPromise
  }


  speechSdkPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {

        const existing =
          document.querySelector(
            '#azure-speech-sdk-script'
          )


        const finish =
          () => {

            if (window.SpeechSDK) {
              resolve(
                window.SpeechSDK
              )
            } else {
              speechSdkPromise =
                null
              reject(
                new Error(
                  'Azure Speech SDK could not be loaded.'
                )
              )
            }
          }


        if (existing) {

          existing.addEventListener(
            'load',
            finish,
            {
              once:
                true
            }
          )

          existing.addEventListener(
            'error',
            () => {
              speechSdkPromise =
                null
              reject(
                new Error(
                  'Unable to load Azure Speech SDK.'
                )
              )
            },
            {
              once:
                true
            }
          )

          return
        }


        const script =
          document.createElement(
            'script'
          )


        script.id =
          'azure-speech-sdk-script'

        script.src =
          SPEECH_SDK_URL

        script.async =
          true


        script.addEventListener(
          'load',
          finish,
          {
            once:
              true
          }
        )


        script.addEventListener(
          'error',
          () => {

            speechSdkPromise =
              null

            reject(
              new Error(
                'Unable to load Azure Speech SDK. Check the internet connection.'
              )
            )
          },
          {
            once:
              true
          }
        )


        document.head.appendChild(
          script
        )
      }
    )


  return speechSdkPromise
}


function startRecognizer(
  recognizer
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      recognizer.startContinuousRecognitionAsync(
        resolve,
        error =>
          reject(
            new Error(
              String(
                error ||
                'Unable to start speech recognition.'
              )
            )
          )
      )
    }
  )
}


function stopRecognizer(
  recognizer
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      recognizer.stopContinuousRecognitionAsync(
        resolve,
        error =>
          reject(
            new Error(
              String(
                error ||
                'Unable to stop speech recognition.'
              )
            )
          )
      )
    }
  )
}


function applyChristianPhraseList(
  sdk,
  recognizer,
  sourceLanguage
) {

  const phrases =
    getChurchSpeechPhrases(
      sourceLanguage
    )


  if (!phrases.length) {
    return
  }


  try {

    const phraseListGrammar =
      sdk.PhraseListGrammar
        ?.fromRecognizer?.(
          recognizer
        )


    if (!phraseListGrammar) {
      return
    }


    phrases.forEach(
      phrase => {

        if (phrase) {
          phraseListGrammar.addPhrase(
            phrase
          )
        }
      }
    )

  } catch (error) {

    console.warn(
      'Unable to apply Christian sermon vocabulary:',
      error
    )
  }
}



function getTargetLanguages(
  sourceLanguage
) {

  return [
    'danish',
    'english',
    'urdu'
  ]
    .filter(
      key =>
        key !==
        sourceLanguage
    )
}


function getSessionTargets(
  session
) {

  const targets =
    Array.isArray(
      session?.targetLanguages
    )
      ? session.targetLanguages
          .filter(
            key =>
              LANGUAGES[key]
          )
      : []


  if (targets.length) {
    return targets
  }


  return getTargetLanguages(
    session?.sourceLanguage
  )
}


function normalizeSelectedLanguage() {

  const targets =
    getSessionTargets(
      overlayCurrentSession
    )


  if (
    targets.includes(
      overlaySelectedLanguage
    )
  ) {
    return
  }


  overlaySelectedLanguage =
    targets[0] ||
    ''
}


function getLanguage(
  languageKey
) {

  return (
    LANGUAGES[languageKey] ||
    LANGUAGES.danish
  )
}


function createSessionId() {

  const random =
    globalThis.crypto
      ?.randomUUID?.()
      ?.replace(
        /-/g,
        ''
      ) ||
    Math.random()
      .toString(
        36
      )
      .slice(
        2
      )


  return `LIVE_${Date.now()}_${random}`
}


function setLiveButtonState(
  button,
  isLive
) {

  button.textContent =
    isLive
      ? '🔴 LIVE TRANSLATION'
      : 'Live Translation — Not Started'

  button.style.width =
    '100%'

  button.style.padding =
    '11px'

  button.style.marginTop =
    '12px'

  button.style.fontWeight =
    '700'

  button.style.borderRadius =
    '8px'


  if (isLive) {

    button.style.background =
      '#b42318'

    button.style.color =
      '#ffffff'

    button.style.border =
      '0'

  } else {

    button.style.background =
      '#ffffff'

    button.style.color =
      '#222222'

    button.style.border =
      '1px solid #bbbbbb'
  }
}


function setInterimText(
  text
) {

  const element =
    document.querySelector(
      '#live-sermon-interim'
    )


  if (!element) {
    return
  }


  const value =
    String(
      text ||
      ''
    ).trim()


  element.textContent =
    value

  element.style.display =
    value
      ? 'block'
      : 'none'
}


function setOverlayMessage(
  message
) {

  const container =
    document.querySelector(
      '#live-sermon-transcript'
    )


  if (!container) {
    return
  }


  container.textContent =
    message
}


async function stopOverlaySegmentsListener() {

  const unsubscribe =
    overlaySegmentsUnsubscribe


  overlaySegmentsUnsubscribe =
    null


  if (unsubscribe) {

    try {
      await unsubscribe()
    } catch (error) {
      console.warn(
        'Unable to stop live sermon text listener:',
        error
      )
    }
  }
}


async function stopOverlayListeners() {

  await stopOverlaySegmentsListener()


  const unsubscribe =
    overlaySessionUnsubscribe


  overlaySessionUnsubscribe =
    null


  if (unsubscribe) {

    try {
      await unsubscribe()
    } catch (error) {
      console.warn(
        'Unable to stop Live Translation listener:',
        error
      )
    }
  }
}


function escapeHtml(
  value
) {

  return String(
    value ||
    ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#39;'
    )
}
