import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  browseOneInChristHymnbook
} from '../shared/hymnbookBrowser.js'

import {
  chooseAndUploadLyricsImage,
  deleteLyricsImage
} from './choirImageStore.js'

import {
  detectChoirHymnTitle
} from './choirOcrStore.js'


let currentSongs = []

let currentHolySpiritHymn =
  createEmptySong(
    'online'
  )


export function createEmptySong(
  sourceType = 'online'
) {

  return {
    sourceType,

    title: '',

    urduTitle: '',


    notes: '',

    lyricsUrl: '',

    lyricsImageUrl: '',

    lyricsImagePath: ''
  }
}


function normalizeSong(
  song
) {

  const normalized = {
    sourceType: '',

    title:
      String(
        song?.title ||
        song?.romanTitle ||
        ''
      ),

    urduTitle:
      String(
        song?.urduTitle || ''
      ),


    notes:
      String(
        song?.notes || ''
      ),

    lyricsUrl:
      String(
        song?.lyricsUrl || ''
      ),

    lyricsImageUrl:
      String(
        song?.lyricsImageUrl || ''
      ),

    lyricsImagePath:
      String(
        song?.lyricsImagePath || ''
      )
  }


  /*
   * Existing plans were created before
   * sourceType existed.
   *
   * Detect their type automatically so
   * old Choir plans continue to work.
   */
  if (
    song?.sourceType === 'image' ||
    song?.sourceType === 'online'
  ) {

    normalized.sourceType =
      song.sourceType

  } else if (
    normalized.lyricsImageUrl
  ) {

    normalized.sourceType =
      'image'

  } else {

    normalized.sourceType =
      'online'
  }


  /*
   * A hymn can have only ONE lyrics
   * source in the new structure.
   */
  if (
    normalized.sourceType ===
    'image'
  ) {

    normalized.lyricsUrl =
      ''

  } else {

    normalized.lyricsImageUrl =
      ''

    normalized.lyricsImagePath =
      ''
  }


  return normalized
}


export function setChoirSongs(
  songs
) {

  currentSongs =
    Array.isArray(
      songs
    )
      ? songs.map(
          normalizeSong
        )
      : []


  if (!currentSongs.length) {

    currentSongs.push(
      createEmptySong()
    )
  }
}


export function resetChoirSongs() {

  currentSongs = [
    createEmptySong(
      'online'
    )
  ]


  currentHolySpiritHymn =
    createEmptySong(
      'online'
    )
}


export function setHolySpiritHymn(
  hymn
) {

  currentHolySpiritHymn =
    normalizeSong(
      hymn ||
      createEmptySong()
    )
}


export function getChoirSongs() {

  return currentSongs
    .map(
      serializeSong
    )
    .filter(
      song => {

        if (
          song.sourceType ===
          'image'
        ) {

          return Boolean(
            song.title ||
            song.lyricsImageUrl
          )
        }


        return Boolean(
          song.title ||
          song.lyricsUrl
        )
      }
    )
}


export function getHolySpiritHymn() {

  const hymn =
    serializeSong(
      currentHolySpiritHymn,
      0
    )


  if (
    !hymn.title &&
    !hymn.lyricsUrl &&
    !hymn.lyricsImageUrl
  ) {

    return {}
  }


  return hymn
}


function serializeSong(
  song,
  index
) {

  const sourceType =
    song.sourceType ===
    'image'
      ? 'image'
      : 'online'


  const title =
    String(
      song.title || ''
    ).trim()


  const urduTitle =
    String(
      song.urduTitle || ''
    ).trim()


  const lyricsUrl =
    sourceType ===
    'online'
      ? String(
          song.lyricsUrl || ''
        ).trim()
      : ''


  const lyricsImageUrl =
    sourceType ===
    'image'
      ? String(
          song.lyricsImageUrl ||
          ''
        ).trim()
      : ''


  const lyricsImagePath =
    sourceType ===
    'image'
      ? String(
          song.lyricsImagePath ||
          ''
        ).trim()
      : ''


  return {

    sourceType,

    title:
      title ||
      (
        sourceType ===
          'image' &&
        lyricsImageUrl
          ? `Hymn ${index + 1}`
          : ''
      ),

    urduTitle,


    notes:
      String(
        song.notes || ''
      ).trim(),

    lyricsUrl,

    lyricsImageUrl,

    lyricsImagePath
  }
}


export function renderChoirSongEditor() {

  const container =
    document.querySelector(
      '#choir-song-list'
    )


  if (!container) {
    return
  }


  container.innerHTML = ''


  currentSongs.forEach(
    (song, index) => {

      container.appendChild(
        createSongEditorCard(
          song,
          index
        )
      )
    }
  )
}


export function renderHolySpiritHymnEditor() {

  const container =
    document.querySelector(
      '#choir-holy-spirit-hymn'
    )


  if (!container) {
    return
  }


  container.innerHTML = ''


  container.appendChild(
    createSongEditorCard(
      currentHolySpiritHymn,
      0,
      {
        title:
          'Holy Spirit Hymn',

        songs:
          [currentHolySpiritHymn],

        render:
          renderHolySpiritHymnEditor,

        hideOrderActions:
          true
      }
    )
  )
}


function createSongEditorCard(
  song,
  index,
  options = {}
) {

  const songs =
    options.songs ||
    currentSongs


  const render =
    options.render ||
    renderChoirSongEditor

  const card =
    document.createElement(
      'div'
    )


  card.style.border =
    '1px solid #dddddd'

  card.style.borderRadius =
    '10px'

  card.style.padding =
    '14px'

  card.style.marginBottom =
    '14px'


  card.innerHTML = `
    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        margin-bottom:12px;
      "
    >

      <strong
        style="
          font-size:17px;
        "
      >
        ${
          options.title ||
          `Hymn ${index + 1}`
        }
      </strong>


      ${
        options.hideOrderActions
          ? ''
          : `
      <div
        style="
          display:flex;
          gap:5px;
          flex-wrap:wrap;
          justify-content:flex-end;
        "
      >

        <button
          type="button"
          data-action="up"
        >
          ↑
        </button>


        <button
          type="button"
          data-action="down"
        >
          ↓
        </button>


        <button
          type="button"
          data-action="remove"
        >
          Remove
        </button>

      </div>
          `
      }

    </div>


    <div
      style="
        margin-bottom:15px;
      "
    >

      <label>
        <strong>
          Lyrics Source
        </strong>
      </label>


      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:8px;
          margin-top:7px;
        "
      >

        <button
          type="button"
          data-source-type="online"
          style="
            padding:11px;
            font-weight:bold;
            ${
              song.sourceType ===
              'online'
                ? 'border:2px solid #333;'
                : ''
            }
          "
        >
          Hymnbook
        </button>


        <button
          type="button"
          data-source-type="image"
          style="
            padding:11px;
            font-weight:bold;
            ${
              song.sourceType ===
              'image'
                ? 'border:2px solid #333;'
                : ''
            }
          "
        >
          Image Hymn
        </button>

      </div>

    </div>


    <label>
      Urdu hymn title
    </label>

    <input
      data-field="urduTitle"
      value="${escapeAttribute(
        song.urduTitle
      )}"
      type="text"
      dir="rtl"
      placeholder="Filled automatically from One in Christ Hymnbook"
      style="
        width:100%;
        box-sizing:border-box;
        padding:9px;
        margin:5px 0 12px;
        text-align:right;
      "
    >


    <label>
      Roman hymn title
    </label>

    <input
      data-field="title"
      value="${escapeAttribute(
        song.title
      )}"
      type="text"
      placeholder="${
        song.sourceType ===
        'image'
          ? 'Read automatically from the image'
          : 'Filled automatically from One in Christ Hymnbook'
      }"
      style="
        width:100%;
        box-sizing:border-box;
        padding:9px;
        margin:5px 0 12px;
      "
    >


    <label>
      Rehearsal notes
    </label>

    <textarea
      data-field="notes"
      rows="3"
      style="
        width:100%;
        box-sizing:border-box;
        padding:9px;
        margin:5px 0 14px;
      "
    >${escapeHtml(
      song.notes
    )}</textarea>


    ${
      song.sourceType ===
      'image'
        ? createImageSourceMarkup(
            song
          )
        : createOnlineSourceMarkup(
            song
          )
    }
  `


  bindSongFields(
    card,
    index,
    songs
  )


  bindSourceTypeButtons(
    card,
    index,
    songs,
    render
  )


  if (
    song.sourceType ===
    'online'
  ) {

    bindHymnbookBrowser(
      card,
      index,
      songs
    )

  } else {

    bindImageActions(
      card,
      index,
      songs,
      render
    )
  }


  if (
    !options.hideOrderActions
  ) {

    bindOrderActions(
      card,
      index
    )
  }


  return card
}


function createOnlineSourceMarkup(
  song
) {

  return `
    <div
      style="
        border-top:1px solid #eeeeee;
        padding-top:14px;
      "
    >

      <strong>
        Hymnbook
      </strong>


      <p
        style="
          margin:5px 0 10px;
          font-size:13px;
        "
      >
        Open the One in Christ Hymnbook,
        choose a Geet or Zaboor, then
        select the hymn.
      </p>


      <button
        type="button"
        data-action="browse-hymnbook"
        style="
          width:100%;
          padding:11px;
          font-weight:bold;
        "
      >
        Browse One in Christ Hymnbook
      </button>


      <div
        data-hymnbook-status
        style="
          min-height:18px;
          font-size:13px;
          margin-top:7px;
        "
      ></div>

    </div>
  `
}


function createImageSourceMarkup(
  song
) {

  return `
    <div
      style="
        border-top:1px solid #eeeeee;
        padding-top:14px;
      "
    >

      <strong>
        Image Hymn
      </strong>


      <p
        style="
          margin:5px 0 10px;
          font-size:13px;
        "
      >
        Attach a picture of the
        lyrics. The app will try to
        read the hymn title
        automatically.
      </p>


      <button
        type="button"
        data-action="attach-image"
        style="
          width:100%;
          padding:11px;
          font-weight:bold;
        "
      >
        ${
          song.lyricsImageUrl
            ? 'Replace Lyrics Image'
            : 'Attach Lyrics Image'
        }
      </button>


      <div
        data-image-status
        style="
          min-height:20px;
          margin-top:8px;
          font-size:13px;
        "
      >
        ${
          song.lyricsImageUrl
            ? 'Lyrics image attached.'
            : ''
        }
      </div>


      <div
        data-image-actions
        style="
          display:${
            song.lyricsImageUrl
              ? 'flex'
              : 'none'
          };
          gap:8px;
          flex-wrap:wrap;
          margin-top:8px;
        "
      >

        <button
          type="button"
          data-action="view-image"
        >
          View Image
        </button>


        <button
          type="button"
          data-action="remove-image"
        >
          Remove Image
        </button>

      </div>

    </div>
  `
}


function bindSongFields(
  card,
  index,
  songs = currentSongs
) {

  card
    .querySelectorAll(
      '[data-field]'
    )
    .forEach(
      input => {

        const update =
          () => {

            songs[index][
              input.dataset.field
            ] =
              input.value
          }


        input.addEventListener(
          'input',
          update
        )


        input.addEventListener(
          'change',
          update
        )
      }
    )
}


function bindSourceTypeButtons(
  card,
  index,
  songs = currentSongs,
  render = renderChoirSongEditor
) {

  card
    .querySelectorAll(
      '[data-source-type]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          async () => {

            const newType =
              button.dataset
                .sourceType


            const oldType =
              songs[index]
                .sourceType


            if (
              newType ===
              oldType
            ) {

              return
            }


            /*
             * Switching away from an
             * uploaded image removes the
             * unused Storage file.
             */
            if (
              oldType === 'image' &&
              songs[index]
                .lyricsImagePath
            ) {

              const confirmed =
                window.confirm(
                  'Switch to Hymnbook?\n\nThe attached lyrics image will be removed.'
                )


              if (!confirmed) {
                return
              }


              try {

                await deleteLyricsImage(
                  songs[index]
                    .lyricsImagePath
                )

              } catch (error) {

                console.error(
                  'Unable to remove old lyrics image:',
                  error
                )


                alert(
                  'Unable to remove the current lyrics image.'
                )

                return
              }
            }


            if (
              newType ===
              'image'
            ) {

              songs[index]
                .sourceType =
                  'image'


              songs[index]
                .lyricsUrl =
                  ''


              /*
               * Clear the previous online
               * title so OCR can supply
               * the title for this image.
               */
              songs[index]
                .title =
                  ''

              songs[index]
                .urduTitle =
                  ''


            } else {

              songs[index]
                .sourceType =
                  'online'


              songs[index]
                .lyricsImageUrl =
                  ''


              songs[index]
                .lyricsImagePath =
                  ''


              songs[index]
                .title =
                  ''

              songs[index]
                .urduTitle =
                  ''
            }


            render()
          }
        )
      }
    )
}


function bindHymnbookBrowser(
  card,
  index,
  songs = currentSongs
) {

  const button =
    card.querySelector(
      '[data-action="browse-hymnbook"]'
    )


  if (!button) {
    return
  }


  button.addEventListener(
    'click',
    async () => {

      const status =
        card.querySelector(
          '[data-hymnbook-status]'
        )


      status.textContent =
        'Choose a Geet or Zaboor, open it, then press Select this hymn.'


      await browseOneInChristHymnbook(
        selected => {

          if (!selected) {
            return
          }


          if (
            selected.url
          ) {

            songs[index]
              .lyricsUrl =
                selected.url
          }


          if (
            selected.title
          ) {

            songs[index]
              .title =
                selected.romanTitle ||
                selected.title


            const titleInput =
              card.querySelector(
                '[data-field="title"]'
              )


            if (titleInput) {

              titleInput.value =
                songs[index].title
            }
          }


          songs[index]
            .urduTitle =
              selected.urduTitle ||
              ''


          const urduTitleInput =
            card.querySelector(
              '[data-field="urduTitle"]'
            )


          if (urduTitleInput) {

            urduTitleInput.value =
              songs[index].urduTitle
          }


          if (
            selected.title &&
            selected.url
          ) {

            status.textContent =
              'Hymn selected from the One in Christ Hymnbook.'

          } else if (
            selected.url
          ) {

            status.textContent =
              'Hymn selected. Please enter the title manually.'

          } else {

            status.textContent =
              'Unable to capture this hymn.'
          }
        }
      )
    }
  )
}


function bindImageActions(
  card,
  index,
  songs = currentSongs,
  render = renderChoirSongEditor
) {

  const attachButton =
    card.querySelector(
      '[data-action="attach-image"]'
    )


  if (!attachButton) {
    return
  }


  attachButton.addEventListener(
    'click',
    async event => {

      const button =
        event.currentTarget


      const status =
        card.querySelector(
          '[data-image-status]'
        )


      button.disabled =
        true


      status.textContent =
        'Uploading image...'


      try {

        const user =
          await getCurrentMember()


        if (!user?.uid) {

          throw new Error(
            'Please sign in again.'
          )
        }


        const uploaded =
          await chooseAndUploadLyricsImage({
            uid:
              user.uid
          })


        if (!uploaded) {

          status.textContent =
            'No image selected.'

          return
        }


        const oldPath =
          songs[index]
            .lyricsImagePath


        songs[index]
          .sourceType =
            'image'


        songs[index]
          .lyricsUrl =
            ''


        songs[index]
          .lyricsImageUrl =
            uploaded.url


        songs[index]
          .lyricsImagePath =
            uploaded.path


        status.textContent =
          'Image uploaded. Reading hymn title...'


        try {

          const detectedTitle =
            await detectChoirHymnTitle(
              uploaded.path
            )


          if (detectedTitle) {

            songs[index]
              .title =
                detectedTitle


            status.textContent =
              'Image uploaded and hymn title detected automatically.'

          } else {

            status.textContent =
              'Image uploaded. Title could not be detected; please enter it manually.'
          }


        } catch (ocrError) {

          console.error(
            'Hymn title detection failed:',
            ocrError
          )


          status.textContent =
            'Image uploaded. Automatic title reading failed; please enter the title manually.'
        }


        if (
          oldPath &&
          oldPath !==
            uploaded.path
        ) {

          try {

            await deleteLyricsImage(
              oldPath
            )

          } catch (error) {

            console.warn(
              'Old lyrics image could not be removed:',
              error
            )
          }
        }


        render()


      } catch (error) {

        console.error(
          'Lyrics image upload failed:',
          error
        )


        status.textContent =
          `Upload failed: ${
            error?.message ||
            error
          }`


      } finally {

        button.disabled =
          false
      }
    }
  )


  const viewButton =
    card.querySelector(
      '[data-action="view-image"]'
    )


  if (viewButton) {

    viewButton.addEventListener(
      'click',
      () => {

        if (
          songs[index]
            .lyricsImageUrl
        ) {

          openLyricsImage(
            songs[index]
              .lyricsImageUrl,

            songs[index]
              .title
          )
        }
      }
    )
  }


  const removeButton =
    card.querySelector(
      '[data-action="remove-image"]'
    )


  if (removeButton) {

    removeButton.addEventListener(
      'click',
      async () => {

        const confirmed =
          window.confirm(
            'Remove this lyrics image?'
          )


        if (!confirmed) {
          return
        }


        const path =
          songs[index]
            .lyricsImagePath


        if (path) {

          try {

            await deleteLyricsImage(
              path
            )

          } catch (error) {

            console.error(
              'Unable to remove lyrics image:',
              error
            )


            alert(
              'Unable to remove the lyrics image.'
            )

            return
          }
        }


        songs[index]
          .lyricsImageUrl =
            ''


        songs[index]
          .lyricsImagePath =
            ''


        render()
      }
    )
  }
}


function bindOrderActions(
  card,
  index
) {

  card
    .querySelector(
      '[data-action="up"]'
    )
    .addEventListener(
      'click',
      () => {

        moveSong(
          index,
          -1
        )
      }
    )


  card
    .querySelector(
      '[data-action="down"]'
    )
    .addEventListener(
      'click',
      () => {

        moveSong(
          index,
          1
        )
      }
    )


  card
    .querySelector(
      '[data-action="remove"]'
    )
    .addEventListener(
      'click',
      async () => {

        if (
          currentSongs[index]
            .lyricsImagePath
        ) {

          const confirmed =
            window.confirm(
              'Remove this hymn and its attached lyrics image?'
            )


          if (!confirmed) {
            return
          }


          try {

            await deleteLyricsImage(
              currentSongs[index]
                .lyricsImagePath
            )

          } catch (error) {

            console.warn(
              'Lyrics image could not be removed:',
              error
            )
          }
        }


        currentSongs.splice(
          index,
          1
        )


        if (
          currentSongs.length ===
          0
        ) {

          currentSongs.push(
            createEmptySong()
          )
        }


        renderChoirSongEditor()
      }
    )
}


function moveSong(
  index,
  direction
) {

  const newIndex =
    index + direction


  if (
    newIndex < 0 ||
    newIndex >=
      currentSongs.length
  ) {

    return
  }


  const temporarySong =
    currentSongs[index]


  currentSongs[index] =
    currentSongs[newIndex]


  currentSongs[newIndex] =
    temporarySong


  renderChoirSongEditor()
}


export function addChoirSong() {

  /*
   * Every Add Hymn creates a completely
   * separate hymn entry.
   */
  currentSongs.push(
    createEmptySong(
      'online'
    )
  )


  renderChoirSongEditor()
}


export function openLyricsImage(
  imageUrl,
  title
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
    '90000'

  overlay.style.background =
    '#ffffff'

  overlay.style.overflow =
    'auto'

  overlay.style.padding =
    '15px'

  overlay.style.boxSizing =
    'border-box'


  const header =
    document.createElement(
      'div'
    )


  header.style.display =
    'flex'

  header.style.justifyContent =
    'space-between'

  header.style.alignItems =
    'center'

  header.style.gap =
    '10px'

  header.style.marginBottom =
    '15px'


  const heading =
    document.createElement(
      'strong'
    )


  heading.textContent =
    title ||
    'Lyrics'


  const closeButton =
    document.createElement(
      'button'
    )


  closeButton.type =
    'button'

  closeButton.textContent =
    'Close'


  closeButton.addEventListener(
    'click',
    () => {

      overlay.remove()
    }
  )


  header.appendChild(
    heading
  )


  header.appendChild(
    closeButton
  )


  const image =
    document.createElement(
      'img'
    )


  image.src =
    imageUrl


  image.alt =
    title ||
    'Lyrics image'


  image.style.display =
    'block'

  image.style.width =
    '100%'

  image.style.height =
    'auto'

  image.style.maxWidth =
    '900px'

  image.style.margin =
    '0 auto'


  overlay.appendChild(
    header
  )


  overlay.appendChild(
    image
  )


  document.body.appendChild(
    overlay
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


function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  )
}
