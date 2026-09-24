import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  closeChoirService,
  reopenChoirService,
  markChoirPlanReadyForServicePlan
} from './choirStore.js'

import {
  isAutomaticallyExpired,
  isArchivedPlan,
  isVisiblePlan
} from './choirArchive.js'

import {
  openLyricsImage
} from './choirSongEditor.js'

import {
  openHymnLyrics
} from '../shared/hymnbookBrowser.js'

import {
  createChoirPlanFeedback
} from './choirFeedbackStore.js'


const choirFeedbackAudio =
  new Map()


export function renderChoirPlans({
  plans,
  isAdmin,
  targetId,
  archiveVisible,
  onEdit,
  onRefresh,
  onArchiveClosed
}) {

  const content =
    document.querySelector(
      '#choir-content'
    )


  if (!content) {
    return
  }


  content.innerHTML =
    ''


  let plansToDisplay

  if (isAdmin) {

    if (archiveVisible) {

      plansToDisplay =
        plans.filter(
          plan =>
            isArchivedPlan(
              plan
            )
        )

    } else {

      plansToDisplay =
        plans.filter(
          plan =>
            !isArchivedPlan(
              plan
            )
        )
    }

  } else {

    plansToDisplay =
      plans.filter(
        plan =>
          isVisiblePlan(
            plan
          )
      )
  }


  if (!plansToDisplay.length) {

    content.innerHTML =
      archiveVisible
        ? `
            <p>
              No archived services.
            </p>
          `
        : `
            <p>
              No current Sunday hymn
              plans are available.
            </p>
          `

    return
  }


  if (
    isAdmin &&
    archiveVisible
  ) {

    renderArchiveHeading(
      content
    )
  }


  const orderedPlans =
    prioritizeTargetPlan(
      plansToDisplay,
      targetId
    )


  orderedPlans.forEach(
    plan => {

      content.appendChild(
        createPlanCard({
          plan,
          isAdmin,
          onEdit,
          onRefresh,
          onArchiveClosed
        })
      )
    }
  )
}


function prioritizeTargetPlan(
  plans,
  targetId
) {

  if (!targetId) {

    return plans
  }


  return [
    ...plans.filter(
      plan =>
        plan.id ===
        targetId
    ),

    ...plans.filter(
      plan =>
        plan.id !==
        targetId
    )
  ]
}


function renderArchiveHeading(
  content
) {

  const heading =
    document.createElement(
      'h3'
    )


  heading.textContent =
    'Service Archive'


  heading.style.marginTop =
    '0'


  content.appendChild(
    heading
  )


  const info =
    document.createElement(
      'p'
    )


  info.textContent =
    'Closed services and services older than 24 hours are kept here.'


  info.style.fontSize =
    '13px'

  info.style.marginBottom =
    '18px'


  content.appendChild(
    info
  )
}


function createPlanCard({
  plan,
  isAdmin,
  onEdit,
  onRefresh,
  onArchiveClosed
}) {

  const card =
    document.createElement(
      'div'
    )


  card.style.border =
    '1px solid #dddddd'

  card.style.borderRadius =
    '12px'

  card.style.padding =
    '16px'

  card.style.marginBottom =
    '16px'


  renderPlanHeader(
    card,
    plan,
    isAdmin
  )


  if (
    isAdmin &&
    isArchivedPlan(
      plan
    )
  ) {

    renderArchiveStatus(
      card,
      plan
    )
  }


  renderSongs(
    card,
    plan
  )


  renderHolySpiritHymn(
    card,
    plan
  )


  renderChoirAudioMessage(
    card,
    plan
  )


  if (!isAdmin) {

    renderChoirFeedbackForm(
      card,
      plan
    )
  }


  if (
    isAdmin &&
    plan.congregationShare
  ) {

    renderCongregationInfo(
      card,
      plan
    )
  }


  if (isAdmin) {

    renderAdminActions({
      card,
      plan,
      onEdit,
      onRefresh,
      onArchiveClosed
    })
  }


  return card
}


function renderPlanHeader(
  card,
  plan,
  isAdmin
) {

  const heading =
    document.createElement(
      'h3'
    )


  heading.textContent =
    plan.title ||
    'Sunday Worship'


  heading.style.marginTop =
    '0'

  heading.style.marginBottom =
    '8px'


  card.appendChild(
    heading
  )


  const serviceInfo =
    document.createElement(
      'div'
    )


  serviceInfo.style.marginBottom =
    '14px'


  serviceInfo.innerHTML =
    `
      <strong>
        ${escapeHtml(
          formatDate(
            plan.date
          )
        )}
      </strong>

      ${
        plan.serviceTime
          ? ` · ${escapeHtml(
              plan.serviceTime
            )}`
          : ''
      }

      ${
        isAdmin
          ? ` · ${
              plan.active
                ? 'Published'
                : 'Unpublished'
            }`
          : ''
      }
    `


  card.appendChild(
    serviceInfo
  )
}


function renderArchiveStatus(
  card,
  plan
) {

  const status =
    document.createElement(
      'div'
    )


  status.style.padding =
    '8px 10px'

  status.style.marginBottom =
    '12px'

  status.style.background =
    '#f5f5f5'

  status.style.borderRadius =
    '7px'

  status.style.fontSize =
    '13px'


  status.textContent =
    plan.archived === true
      ? 'Service closed by administrator.'
      : 'Automatically archived 24 hours after service start.'


  card.appendChild(
    status
  )
}


function renderSongs(
  card,
  plan
) {

  const songs =
    Array.isArray(
      plan.songs
    )
      ? plan.songs
      : []


  if (!songs.length) {

    const empty =
      document.createElement(
        'p'
      )


    empty.textContent =
      'No hymns added.'


    card.appendChild(
      empty
    )

    return
  }


  songs.forEach(
    (song, index) => {

      card.appendChild(
        createMemberSong(
          song,
          index
        )
      )
    }
  )
}


function renderHolySpiritHymn(
  card,
  plan
) {

  const hymn =
    plan.holySpiritHymn || {}


  if (
    !hymn.title &&
    !hymn.lyricsUrl &&
    !hymn.lyricsImageUrl
  ) {
    return
  }


  const heading =
    document.createElement(
      'h4'
    )


  heading.textContent =
    'Holy Spirit Hymn'

  heading.style.marginBottom =
    '6px'


  card.appendChild(
    heading
  )

  card.appendChild(
    createMemberSong(
      hymn,
      0
    )
  )
}


function createMemberSong(
  song,
  index
) {

  const wrapper =
    document.createElement(
      'div'
    )


  wrapper.style.padding =
    '12px 0'


  wrapper.style.borderTop =
    index === 0
      ? 'none'
      : '1px solid #eeeeee'


  const title =
    document.createElement(
      'div'
    )


  title.style.fontSize =
    '17px'

  title.style.fontWeight =
    'bold'


  if (song.urduTitle) {

    const urduTitle =
      document.createElement(
        'div'
      )

    urduTitle.className =
      'urdu-text'

    urduTitle.dir =
      'rtl'

    urduTitle.style.textAlign =
      'right'

    urduTitle.style.fontSize =
      '20px'

    urduTitle.style.lineHeight =
      '1.8'

    urduTitle.textContent =
      `${index + 1}. ${song.urduTitle}`

    title.appendChild(
      urduTitle
    )


    const romanTitle =
      document.createElement(
        'div'
      )

    romanTitle.style.marginTop =
      '2px'

    romanTitle.textContent =
      song.title ||
      'Untitled Hymn'

    title.appendChild(
      romanTitle
    )

  } else {

    title.textContent =
      `${index + 1}. ${
        song.title ||
        'Untitled Hymn'
      }`
  }


  wrapper.appendChild(
    title
  )


  if (song.notes) {

    const notes =
      document.createElement(
        'div'
      )


    notes.textContent =
      song.notes


    notes.style.marginTop =
      '8px'

    notes.style.fontSize =
      '14px'

    notes.style.lineHeight =
      '1.4'


    wrapper.appendChild(
      notes
    )
  }


  const buttons =
    document.createElement(
      'div'
    )


  buttons.style.display =
    'flex'

  buttons.style.flexWrap =
    'wrap'

  buttons.style.gap =
    '8px'

  buttons.style.marginTop =
    '10px'


  if (song.lyricsUrl) {

    const linkButton =
      document.createElement(
        'button'
      )


    linkButton.type =
      'button'


    linkButton.textContent =
      'View Lyrics'


    linkButton.addEventListener(
      'click',
      () => {

        openHymnLyrics(
          song.lyricsUrl,
          song.title
        )
      }
    )


    buttons.appendChild(
      linkButton
    )
  }


  if (song.lyricsImageUrl) {

    const imageButton =
      document.createElement(
        'button'
      )


    imageButton.type =
      'button'


    imageButton.textContent =
      'View Lyrics Image'


    imageButton.addEventListener(
      'click',
      () => {

        openLyricsImage(
          song.lyricsImageUrl,
          song.title
        )
      }
    )


    buttons.appendChild(
      imageButton
    )
  }


  if (
    song.lyricsUrl ||
    song.lyricsImageUrl
  ) {

    wrapper.appendChild(
      buttons
    )
  }


  return wrapper
}


function renderChoirAudioMessage(
  card,
  plan
) {

  if (!plan.choirAudioMessageUrl) {
    return
  }


  const wrapper =
    document.createElement(
      'div'
    )


  wrapper.style.marginTop =
    '14px'

  wrapper.style.padding =
    '12px'

  wrapper.style.background =
    '#fff8df'

  wrapper.style.border =
    '1px solid #eadcaa'

  wrapper.style.borderRadius =
    '10px'


  const title =
    document.createElement(
      'strong'
    )


  title.textContent =
    'Choir audio message'


  const audio =
    document.createElement(
      'audio'
    )


  audio.controls =
    true

  audio.src =
    plan.choirAudioMessageUrl

  audio.style.width =
    '100%'

  audio.style.marginTop =
    '8px'


  wrapper.appendChild(
    title
  )

  wrapper.appendChild(
    audio
  )

  card.appendChild(
    wrapper
  )
}


function renderCongregationInfo(
  card,
  plan
) {

  const info =
    document.createElement(
      'div'
    )


  info.style.marginTop =
    '14px'

  info.style.padding =
    '10px'

  info.style.background =
    '#f5f5f5'

  info.style.borderRadius =
    '8px'

  info.style.fontSize =
    '13px'


  info.innerHTML =
    `
      <strong>
        Church notification:
      </strong>

      ${escapeHtml(
        plan.notificationDate ||
        ''
      )}

      ${
        plan.notificationTime
          ? ` at ${escapeHtml(
              plan.notificationTime
            )}`
          : ''
      }
    `


  card.appendChild(
    info
  )
}


function renderChoirFeedbackForm(
  card,
  plan
) {

  const wrapper =
    document.createElement(
      'div'
    )


  wrapper.style.marginTop =
    '14px'

  wrapper.style.padding =
    '12px'

  wrapper.style.background =
    '#fff8df'

  wrapper.style.border =
    '1px solid #eadcaa'

  wrapper.style.borderRadius =
    '10px'


  wrapper.innerHTML = `
    <strong>
      Send note to Choir Admin
    </strong>

    <textarea
      class="choir-feedback-note"
      data-plan-id="${escapeHtml(
        plan.id
      )}"
      rows="3"
      placeholder="Write a short note..."
      style="
        width:100%;
        box-sizing:border-box;
        padding:10px;
        margin-top:8px;
        resize:vertical;
      "
    ></textarea>

    <p
      class="choir-feedback-audio-status"
      data-plan-id="${escapeHtml(
        plan.id
      )}"
      style="
        margin:10px 0 0;
        font-size:14px;
      "
    >
      No audio reply recorded.
    </p>

    <div
      class="choir-feedback-audio-preview"
      data-plan-id="${escapeHtml(
        plan.id
      )}"
    ></div>

    <button
      type="button"
      class="record-choir-feedback-audio"
      data-plan-id="${escapeHtml(
        plan.id
      )}"
      style="
        width:100%;
        padding:10px;
        margin-top:8px;
      "
    >
      Record Audio Reply
    </button>

    <button
      type="button"
      class="stop-choir-feedback-audio"
      data-plan-id="${escapeHtml(
        plan.id
      )}"
      disabled
      style="
        width:100%;
        padding:10px;
        margin-top:8px;
      "
    >
      Stop Audio Reply
    </button>

    <button
      type="button"
      class="send-choir-feedback"
      data-plan-id="${escapeHtml(
        plan.id
      )}"
      style="
        width:100%;
        padding:11px;
        margin-top:10px;
        font-weight:bold;
      "
    >
      Send to Choir Admin
    </button>
  `


  card.appendChild(
    wrapper
  )


  bindChoirFeedbackControls(
    wrapper,
    plan
  )
}


function getSupportedChoirFeedbackMimeType() {

  if (!window.MediaRecorder?.isTypeSupported) {
    return ''
  }


  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4'
  ]


  return types.find(
    type => MediaRecorder.isTypeSupported(
      type
    )
  ) || ''
}


function bindChoirFeedbackControls(
  wrapper,
  plan
) {

  const recordButton =
    wrapper.querySelector(
      '.record-choir-feedback-audio'
    )

  const stopButton =
    wrapper.querySelector(
      '.stop-choir-feedback-audio'
    )

  const sendButton =
    wrapper.querySelector(
      '.send-choir-feedback'
    )

  const status =
    wrapper.querySelector(
      '.choir-feedback-audio-status'
    )

  const preview =
    wrapper.querySelector(
      '.choir-feedback-audio-preview'
    )

  let recorder =
    null

  let chunks = []


  recordButton.addEventListener(
    'click',
    async () => {

      if (
        !navigator.mediaDevices ||
        !window.MediaRecorder
      ) {
        status.textContent =
          'Audio recording is not available on this device.'

        return
      }


      try {

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio:
              true
          })

        chunks = []

        const mimeType =
          getSupportedChoirFeedbackMimeType()

        recorder =
          new MediaRecorder(
            stream,
            mimeType
              ? { mimeType }
              : undefined
          )

        recorder.addEventListener(
          'dataavailable',
          event => {
            if (event.data?.size) {
              chunks.push(
                event.data
              )
            }
          }
        )

        recorder.addEventListener(
          'stop',
          () => {
            const audioBlob =
              new Blob(
                chunks,
                {
                  type:
                    recorder.mimeType ||
                    mimeType ||
                    'audio/webm'
                }
              )

            stream
              .getTracks()
              .forEach(
                track => track.stop()
              )

            choirFeedbackAudio.set(
              plan.id,
              audioBlob
            )

            preview.innerHTML = `
              <audio
                controls
                src="${URL.createObjectURL(
                  audioBlob
                )}"
                style="
                  width:100%;
                  margin-top:8px;
                "
              ></audio>
            `

            status.textContent =
              'Audio reply recorded.'

            recordButton.disabled =
              false

            stopButton.disabled =
              true
          }
        )

        recorder.start()

        status.textContent =
          'Recording audio reply...'

        recordButton.disabled =
          true

        stopButton.disabled =
          false

      } catch (error) {

        console.error(
          'Unable to record Choir reply:',
          error
        )

        status.textContent =
          'Unable to start audio reply recording.'
      }
    }
  )


  stopButton.addEventListener(
    'click',
    () => {

      if (
        recorder &&
        recorder.state !== 'inactive'
      ) {
        recorder.stop()
      }
    }
  )


  sendButton.addEventListener(
    'click',
    async () => {

      const note =
        wrapper
          .querySelector(
            '.choir-feedback-note'
          )
          .value
          .trim()

      const audioBlob =
        choirFeedbackAudio.get(
          plan.id
        ) || null

      if (!note && !audioBlob) {
        status.textContent =
          'Please write a note or record an audio reply.'

        return
      }


      sendButton.disabled =
        true

      sendButton.textContent =
        'Sending...'


      try {

        const user =
          await getCurrentMember()

        await createChoirPlanFeedback({
          planId:
            plan.id,
          uid:
            user.uid,
          name:
            user.name || user.email || '',
          note,
          audioBlob
        })

        choirFeedbackAudio.delete(
          plan.id
        )

        wrapper
          .querySelector(
            '.choir-feedback-note'
          )
          .value = ''

        preview.innerHTML =
          ''

        status.textContent =
          'Message sent to Choir Admin.'

      } catch (error) {

        console.error(
          'Unable to send Choir feedback:',
          error
        )

        status.textContent =
          `Unable to send: ${
            error?.message || error
          }`

      } finally {

        sendButton.disabled =
          false

        sendButton.textContent =
          'Send to Choir Admin'
      }
    }
  )
}


function renderAdminActions({
  card,
  plan,
  onEdit,
  onRefresh,
  onArchiveClosed
}) {

  const editButton =
    document.createElement(
      'button'
    )


  editButton.type =
    'button'


  editButton.textContent =
    'Edit Plan'


  editButton.style.width =
    '100%'

  editButton.style.padding =
    '10px'

  editButton.style.marginTop =
    '12px'


  editButton.addEventListener(
    'click',
    () => {

      if (
        typeof onEdit ===
        'function'
      ) {

        onEdit(
          plan
        )
      }
    }
  )


  card.appendChild(
    editButton
  )


  if (
    plan.choirReviewStatus !==
    'readyForServicePlan'
  ) {

    renderReadyForServicePlanButton({
      card,
      plan,
      onRefresh
    })
  }


  if (
    plan.archived === true
  ) {

    renderReopenButton({
      card,
      plan,
      onArchiveClosed
    })

    return
  }


  if (
    !isAutomaticallyExpired(
      plan
    )
  ) {

    renderCloseButton({
      card,
      plan,
      onRefresh
    })
  }
}


function renderReadyForServicePlanButton({
  card,
  plan,
  onRefresh
}) {

  const button =
    document.createElement(
      'button'
    )


  button.type =
    'button'

  button.textContent =
    'Send to Church Plan'

  button.style.width =
    '100%'

  button.style.padding =
    '11px'

  button.style.marginTop =
    '8px'

  button.style.fontWeight =
    'bold'


  button.addEventListener(
    'click',
    async () => {

      const confirmed =
        window.confirm(
          'Send this choir plan to the Church Service Plan section?'
        )

      if (!confirmed) {
        return
      }


      try {

        await markChoirPlanReadyForServicePlan(
          plan.id
        )

        if (
          typeof onRefresh ===
          'function'
        ) {
          await onRefresh()
        }

      } catch (error) {

        console.error(
          'Unable to send Choir plan to Service Plan:',
          error
        )

        alert(
          'Unable to send Choir plan to Church Plan.'
        )
      }
    }
  )


  card.appendChild(
    button
  )
}


function renderCloseButton({
  card,
  plan,
  onRefresh
}) {

  const button =
    document.createElement(
      'button'
    )


  button.type =
    'button'


  button.textContent =
    'Close Service'


  button.style.width =
    '100%'

  button.style.padding =
    '11px'

  button.style.marginTop =
    '8px'

  button.style.fontWeight =
    'bold'


  button.addEventListener(
    'click',
    async () => {

      await closeService(
        plan,
        onRefresh
      )
    }
  )


  card.appendChild(
    button
  )
}


function renderReopenButton({
  card,
  plan,
  onArchiveClosed
}) {

  const button =
    document.createElement(
      'button'
    )


  button.type =
    'button'


  button.textContent =
    'Reopen Service'


  button.style.width =
    '100%'

  button.style.padding =
    '10px'

  button.style.marginTop =
    '8px'


  button.addEventListener(
    'click',
    async () => {

      await reopenService(
        plan,
        onArchiveClosed
      )
    }
  )


  card.appendChild(
    button
  )
}


async function closeService(
  plan,
  onRefresh
) {

  const confirmed =
    window.confirm(
      `Close "${plan.title || 'this service'}"?\n\nIt will disappear from the normal Choir and church-member view but remain in the Service Archive.`
    )


  if (!confirmed) {
    return
  }


  try {

    const user =
      await getCurrentMember()


    if (!user?.uid) {

      throw new Error(
        'Please sign in again.'
      )
    }


    await closeChoirService({
      planId:
        plan.id,

      uid:
        user.uid
    })


    if (
      typeof onRefresh ===
      'function'
    ) {

      await onRefresh()
    }


  } catch (error) {

    console.error(
      'Unable to close service:',
      error
    )


    alert(
      'Unable to close the service.'
    )
  }
}


async function reopenService(
  plan,
  onArchiveClosed
) {

  try {

    await reopenChoirService(
      plan.id
    )


    if (
      typeof onArchiveClosed ===
      'function'
    ) {

      await onArchiveClosed()
    }


  } catch (error) {

    console.error(
      'Unable to reopen service:',
      error
    )


    alert(
      'Unable to reopen the service.'
    )
  }
}


function formatDate(
  value
) {

  if (!value) {
    return ''
  }


  const date =
    new Date(
      `${value}T12:00:00`
    )


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value
  }


  return date.toLocaleDateString(
    'en-GB',
    {

      weekday:
        'long',

      day:
        'numeric',

      month:
        'long',

      year:
        'numeric'
    }
  )
}


function escapeHtml(
  value
) {

  return String(
    value || ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    )
}
