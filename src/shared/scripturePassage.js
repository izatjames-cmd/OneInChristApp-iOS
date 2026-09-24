import {
  getBibleBooks,
  getBibleChapters,
  getBibleVerses,
  getBiblePassage
} from './scriptureBibleApi.js'


const LANGUAGES = [
  {
    id: 'urdu',
    label: 'اردو'
  },
  {
    id: 'danish',
    label: 'Dansk'
  },
  {
    id: 'english',
    label: 'English'
  }
]


const PICKER_ID =
  'oneinchrist-scripture-picker'


export function scriptureReadingCard({
  label,
  id,
  reading = {},
  allowSelect = true,
  removable = false
}) {

  const normalized =
    normalizeScriptureReading(
      reading
    )


  return `
    <section
      class="scripture-reading-card"
      data-scripture-reading-card="${escapeHtml(id)}"
      style="
        border:1px solid #e4ddd4;
        border-radius:12px;
        padding:11px;
        margin-bottom:12px;
        background:#fffdf8;
      "
    >
      <div
        style="
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:8px;
          margin-bottom:2px;
        "
      >
        <div>
          <h3 style="margin:0 0 2px; line-height:1.25;">
            ${escapeHtml(label)}
          </h3>

        </div>

        ${
          removable
            ? `
              <button
                type="button"
                data-remove-scripture-reading
                style="padding:7px 9px;"
              >
                Remove
              </button>
            `
            : ''
        }
      </div>

      ${createLanguageTabsMarkup(normalized)}

      ${
        allowSelect
          ? `
            <button
              type="button"
              data-select-scripture-passage
              style="
                width:100%;
                padding:11px;
                margin-top:10px;
                font-weight:700;
              "
            >
              ${normalized.passageId ? 'Change Passage' : 'Select Passage'}
            </button>
          `
          : ''
      }

      <div
        data-scripture-card-status
        style="
          min-height:18px;
          margin-top:7px;
          font-size:13px;
        "
      ></div>

      <textarea
        id="${escapeHtml(id)}-data"
        data-scripture-reading-data
        style="display:none;"
      >${escapeHtml(JSON.stringify(normalized))}</textarea>
    </section>
  `
}


export function bindScriptureReadingCards(
  container
) {

  container
    .querySelectorAll(
      '[data-scripture-reading-card]'
    )
    .forEach(
      card => {

        bindCardTabs(
          card
        )


        const selectButton =
          card.querySelector(
            '[data-select-scripture-passage]'
          )


        if (
          selectButton &&
          selectButton.dataset.bound !== 'true'
        ) {

          selectButton.dataset.bound =
            'true'


          selectButton.addEventListener(
            'click',
            async () => {

              const id =
                card.dataset
                  .scriptureReadingCard

              const current =
                getScriptureReading(
                  id
                )

              const status =
                card.querySelector(
                  '[data-scripture-card-status]'
                )


              if (status) {
                status.textContent =
                  'Opening Bible selector...'
              }


              try {

                const selected =
                  await openScripturePassagePicker(
                    current
                  )


                if (!selected) {

                  if (status) {
                    status.textContent =
                      ''
                  }

                  return
                }


                setScriptureReading(
                  id,
                  selected
                )


                if (status) {
                  status.textContent =
                    'Bible passage selected.'
                }

              } catch (error) {

                console.error(
                  'Unable to select Bible passage:',
                  error
                )


                if (status) {
                  status.textContent =
                    `Unable to load Bible passage: ${error?.message || error}`
                }
              }
            }
          )
        }
      }
    )
}


export function getScriptureReading(
  id
) {

  const field =
    document.getElementById(
      `${id}-data`
    )


  if (!field) {
    return normalizeScriptureReading({})
  }


  try {

    return normalizeScriptureReading(
      JSON.parse(
        field.value ||
        '{}'
      )
    )

  } catch {

    return normalizeScriptureReading({})
  }
}


export function setScriptureReading(
  id,
  reading
) {

  const field =
    document.getElementById(
      `${id}-data`
    )

  const card =
    document.querySelector(
      `[data-scripture-reading-card="${cssEscape(id)}"]`
    )


  if (
    !field ||
    !card
  ) {
    return
  }


  const normalized =
    normalizeScriptureReading(
      reading
    )


  field.value =
    JSON.stringify(
      normalized
    )


  const summary =
    card.querySelector(
      '[data-scripture-reference-summary]'
    )


  if (summary) {
    summary.textContent =
      getReadingReference(
        normalized
      ) ||
      'No passage selected'
  }


  const existingTabs =
    card.querySelector(
      '[data-scripture-language-area]'
    )


  if (existingTabs) {
    existingTabs.outerHTML =
      createLanguageTabsMarkup(
        normalized
      )
  }


  const selectButton =
    card.querySelector(
      '[data-select-scripture-passage]'
    )


  if (selectButton) {
    selectButton.textContent =
      normalized.passageId
        ? 'Change Passage'
        : 'Select Passage'
  }


  bindCardTabs(
    card
  )
}


export function normalizeScriptureReading(
  reading = {}
) {

  const translations =
    reading.translations ||
    {}


  const english =
    normalizeTranslation(
      translations.english ||
      {
        reference:
          reading.englishReference ||
          reading.reference ||
          '',
        text:
          reading.english ||
          reading.englishReading ||
          ''
      }
    )


  const danish =
    normalizeTranslation(
      translations.danish ||
      {
        reference:
          reading.danishReference ||
          reading.reference ||
          '',
        text:
          reading.danish ||
          ''
      }
    )


  const urdu =
    normalizeTranslation(
      translations.urdu ||
      {
        reference:
          reading.urduReference ||
          reading.reference ||
          '',
        text:
          reading.urdu ||
          ''
      }
    )


  return {
    passageId:
      String(
        reading.passageId ||
        ''
      ).trim(),

    selectedLanguage:
      normalizeLanguage(
        reading.selectedLanguage ||
        'urdu'
      ),

    bookId:
      String(
        reading.bookId ||
        getBookIdFromPassage(
          reading.passageId
        ) ||
        ''
      ).trim(),

    chapterId:
      String(
        reading.chapterId ||
        getChapterIdFromPassage(
          reading.passageId
        ) ||
        ''
      ).trim(),

    startVerseId:
      String(
        reading.startVerseId ||
        getStartVerseId(
          reading.passageId
        ) ||
        ''
      ).trim(),

    endVerseId:
      String(
        reading.endVerseId ||
        getEndVerseId(
          reading.passageId
        ) ||
        ''
      ).trim(),

    reference:
      String(
        reading.reference ||
        english.reference ||
        danish.reference ||
        urdu.reference ||
        ''
      ).trim(),

    translations: {
      urdu,
      danish,
      english
    },

    // Backward-compatible fields used by older Service Plans.
    urduReference:
      urdu.reference,
    urdu:
      urdu.text,
    danishReference:
      danish.reference,
    danish:
      danish.text,
    englishReference:
      english.reference,
    english:
      english.text
  }
}


export function createScriptureReaderMarkup({
  id,
  title,
  reading,
  defaultLanguage = 'urdu',
  collapsible = false,
  collapsedInitially = false
}) {

  const normalized =
    normalizeScriptureReading(
      reading
    )


  if (!hasReading(normalized)) {
    return ''
  }


  const language =
    hasTranslation(
      normalized,
      defaultLanguage
    )
      ? defaultLanguage
      : getFirstAvailableLanguage(
          normalized
        )


  return `
    <section
      data-scripture-reader="${escapeHtml(id)}"
      data-scripture-collapsible="${collapsible ? 'true' : 'false'}"
      data-scripture-open-language="${collapsible && collapsedInitially ? '' : escapeHtml(language)}"
      style="
        margin:6px 0;
        padding:8px;
        border:1px solid #e4ddd4;
        border-radius:10px;
        background:#fffdf8;
        text-align:left;
      "
    >
      ${title ? `
        <h3 style="margin:0 0 2px; line-height:1.25;">
          ${escapeHtml(title)}
        </h3>
      ` : ''}

      ${createReaderLanguageTabs(
        normalized,
        language,
        {
          collapsible,
          collapsedInitially
        }
      )}
    </section>
  `
}


export function bindScriptureReaderTabs(
  container
) {

  const readers = [
    ...(
      container?.matches?.(
        '[data-scripture-reader]'
      )
        ? [container]
        : []
    ),
    ...(
      container?.querySelectorAll?.(
        '[data-scripture-reader]'
      ) ||
      []
    )
  ]


  readers
    .forEach(
      reader => {

        reader
          .querySelectorAll(
            '[data-scripture-reader-tab]'
          )
          .forEach(
            button => {

              if (
                button.dataset.bound === 'true'
              ) {
                return
              }


              button.dataset.bound =
                'true'


              button.addEventListener(
                'click',
                () => {

                  const language =
                    button.dataset
                      .scriptureReaderTab


                  const collapsible =
                    reader.dataset
                      .scriptureCollapsible === 'true'


                  const currentOpen =
                    reader.dataset
                      .scriptureOpenLanguage ||
                    ''


                  if (
                    collapsible &&
                    currentOpen === language
                  ) {

                    reader.dataset
                      .scriptureOpenLanguage =
                      ''


                    reader
                      .querySelectorAll(
                        '[data-scripture-reader-tab]'
                      )
                      .forEach(
                        tab => {
                          setReaderButtonState(
                            tab,
                            false
                          )
                        }
                      )


                    reader
                      .querySelectorAll(
                        '[data-scripture-reader-language]'
                      )
                      .forEach(
                        section => {
                          section.style.display =
                            'none'
                        }
                      )


                    const reference =
                      reader.querySelector(
                        '[data-scripture-active-reference]'
                      )

                    if (reference) {
                      reference.style.display =
                        'none'
                    }

                    return
                  }


                  reader.dataset
                    .scriptureOpenLanguage =
                    language


                  reader
                    .querySelectorAll(
                      '[data-scripture-reader-tab]'
                    )
                    .forEach(
                      tab => {
                        setReaderButtonState(
                          tab,
                          tab === button
                        )
                      }
                    )


                  reader
                    .querySelectorAll(
                      '[data-scripture-reader-language]'
                    )
                    .forEach(
                      section => {
                        section.style.display =
                          section.dataset
                            .scriptureReaderLanguage === language
                            ? 'block'
                            : 'none'
                      }
                    )


                  const reference =
                    reader.querySelector(
                      '[data-scripture-active-reference]'
                    )

                  if (reference) {
                    reference.style.display =
                      'block'
                  }


                  updateScriptureActiveLanguage(
                    reader,
                    language
                  )
                }
              )
            }
          )
      }
    )
}


async function openScripturePassagePicker(
  currentReading = {}
) {

  document
    .getElementById(
      PICKER_ID
    )
    ?.remove()


  const current =
    normalizeScriptureReading(
      currentReading
    )


  return new Promise(
    resolve => {

      const overlay =
        document.createElement(
          'div'
        )

      overlay.id =
        PICKER_ID

      Object.assign(
        overlay.style,
        {
          position: 'fixed',
          inset: '0',
          zIndex: '2147483647',
          background: 'rgba(0,0,0,.55)',
          overflowY: 'auto',
          padding:
            'max(14px, env(safe-area-inset-top)) 12px max(14px, env(safe-area-inset-bottom))'
        }
      )


      overlay.innerHTML = `
        <div
          style="
            width:min(620px,100%);
            margin:0 auto;
            background:#fffdf8;
            border-radius:12px;
            padding:18px;
            box-sizing:border-box;
          "
        >
          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:10px;
              margin-bottom:16px;
            "
          >
            <h2 style="margin:0;">
              Select Bible Passage
            </h2>

            <button
              type="button"
              data-picker-cancel
            >
              Cancel
            </button>
          </div>

          <label>
            Choose the language you prefer for finding the passage
          </label>

          <select
            data-picker-language
            style="width:100%; padding:10px; margin:6px 0 14px;"
          >
            <option value="urdu">Urdu</option>
            <option value="danish">Danish</option>
            <option value="english">English</option>
          </select>

          <label>Book</label>
          <select
            data-picker-book
            style="width:100%; padding:10px; margin:6px 0 14px;"
          >
            <option value="">Loading books...</option>
          </select>

          <label>Chapter</label>
          <select
            data-picker-chapter
            style="width:100%; padding:10px; margin:6px 0 14px;"
          >
            <option value="">Choose a book first</option>
          </select>

          <div
            style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:10px;
            "
          >
            <div>
              <label>From verse</label>
              <select
                data-picker-start-verse
                style="width:100%; padding:10px; margin-top:6px;"
              >
                <option value="">Choose chapter</option>
              </select>
            </div>

            <div>
              <label>To verse</label>
              <select
                data-picker-end-verse
                style="width:100%; padding:10px; margin-top:6px;"
              >
                <option value="">Choose chapter</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            data-picker-preview
            style="
              width:100%;
              padding:12px;
              margin-top:16px;
              font-weight:700;
            "
          >
            Load Passage
          </button>

          <div
            data-picker-status
            style="min-height:20px; margin:10px 0;"
          ></div>

          <div
            data-picker-preview-area
            style="display:none;"
          ></div>

          <button
            type="button"
            data-picker-use
            disabled
            style="
              width:100%;
              padding:12px;
              margin-top:12px;
              font-weight:700;
            "
          >
            Use This Passage
          </button>
        </div>
      `


      document.body.appendChild(
        overlay
      )


      const languageSelect =
        overlay.querySelector(
          '[data-picker-language]'
        )

      const bookSelect =
        overlay.querySelector(
          '[data-picker-book]'
        )

      const chapterSelect =
        overlay.querySelector(
          '[data-picker-chapter]'
        )

      const startSelect =
        overlay.querySelector(
          '[data-picker-start-verse]'
        )

      const endSelect =
        overlay.querySelector(
          '[data-picker-end-verse]'
        )

      const previewButton =
        overlay.querySelector(
          '[data-picker-preview]'
        )

      const useButton =
        overlay.querySelector(
          '[data-picker-use]'
        )

      const status =
        overlay.querySelector(
          '[data-picker-status]'
        )

      const previewArea =
        overlay.querySelector(
          '[data-picker-preview-area]'
        )


      let previewReading =
        null

      let verseList =
        []


      const finish =
        value => {
          overlay.remove()
          resolve(
            value || null
          )
        }


      overlay
        .querySelector(
          '[data-picker-cancel]'
        )
        .addEventListener(
          'click',
          () => finish(null)
        )


      languageSelect.value =
        normalizeLanguage(
          current.selectedLanguage ||
          'urdu'
        )


      languageSelect.addEventListener(
        'change',
        async () => {
          previewReading = null
          useButton.disabled = true
          previewArea.style.display = 'none'
          await loadBooks()
        }
      )


      bookSelect.addEventListener(
        'change',
        async () => {
          previewReading = null
          useButton.disabled = true
          previewArea.style.display = 'none'
          await loadChapters()
        }
      )


      chapterSelect.addEventListener(
        'change',
        async () => {
          previewReading = null
          useButton.disabled = true
          previewArea.style.display = 'none'
          await loadVerses()
        }
      )


      startSelect.addEventListener(
        'change',
        () => {
          const startIndex =
            verseList.findIndex(
              verse =>
                verse.id === startSelect.value
            )

          const endIndex =
            verseList.findIndex(
              verse =>
                verse.id === endSelect.value
            )


          if (
            startIndex >= 0 &&
            endIndex >= 0 &&
            endIndex < startIndex
          ) {
            endSelect.value =
              startSelect.value
          }
        }
      )


      previewButton.addEventListener(
        'click',
        async () => {

          const passageId =
            createPassageId(
              startSelect.value,
              endSelect.value
            )


          if (!passageId) {
            status.textContent =
              'Choose the book, chapter and verses first.'
            return
          }


          previewButton.disabled =
            true

          useButton.disabled =
            true

          status.textContent =
            'Loading Urdu, Danish and English Bible text...'


          try {

            const result =
              await getBiblePassage(
                passageId
              )


            previewReading =
              normalizeScriptureReading({
                passageId:
                  result.passageId,
                selectedLanguage:
                  languageSelect.value,
                bookId:
                  bookSelect.value,
                chapterId:
                  chapterSelect.value,
                startVerseId:
                  startSelect.value,
                endVerseId:
                  endSelect.value,
                translations:
                  result.translations
              })


            previewArea.innerHTML =
              createScriptureReaderMarkup({
                id:
                  'picker-preview',
                title:
                  'Preview',
                reading:
                  previewReading,
                defaultLanguage:
                  languageSelect.value
              })

            previewArea.style.display =
              'block'

            bindScriptureReaderTabs(
              previewArea
            )

            status.textContent =
              'Passage loaded in all three languages.'

            useButton.disabled =
              false

          } catch (error) {

            console.error(
              'Unable to load Bible passage:',
              error
            )

            status.textContent =
              `Unable to load passage: ${error?.message || error}`

          } finally {

            previewButton.disabled =
              false
          }
        }
      )


      useButton.addEventListener(
        'click',
        () => {
          if (previewReading) {
            finish(
              previewReading
            )
          }
        }
      )


      async function loadBooks() {

        status.textContent =
          'Loading Bible books...'

        setSelectLoading(
          bookSelect,
          'Loading books...'
        )

        setSelectLoading(
          chapterSelect,
          'Choose a book first'
        )

        setSelectLoading(
          startSelect,
          'Choose chapter'
        )

        setSelectLoading(
          endSelect,
          'Choose chapter'
        )


        try {

          const books =
            await getBibleBooks(
              languageSelect.value
            )


          fillSelect(
            bookSelect,
            books,
            item => item.id,
            item =>
              item.name ||
              item.nameLong ||
              item.id,
            'Choose book'
          )


          const preferredBook =
            current.bookId


          if (
            preferredBook &&
            books.some(
              book =>
                book.id === preferredBook
            )
          ) {
            bookSelect.value =
              preferredBook
          }


          status.textContent =
            ''


          if (bookSelect.value) {
            await loadChapters()
          }

        } catch (error) {

          status.textContent =
            `Unable to load books: ${error?.message || error}`
        }
      }


      async function loadChapters() {

        if (!bookSelect.value) {
          setSelectLoading(
            chapterSelect,
            'Choose a book first'
          )
          return
        }


        status.textContent =
          'Loading chapters...'

        setSelectLoading(
          chapterSelect,
          'Loading chapters...'
        )


        try {

          const chapters =
            await getBibleChapters({
              language:
                languageSelect.value,
              bookId:
                bookSelect.value
            })


          fillSelect(
            chapterSelect,
            chapters,
            item => item.id,
            item => item.number,
            'Choose chapter'
          )


          if (
            current.chapterId &&
            chapters.some(
              chapter =>
                chapter.id === current.chapterId
            )
          ) {
            chapterSelect.value =
              current.chapterId
          }


          status.textContent =
            ''


          if (chapterSelect.value) {
            await loadVerses()
          }

        } catch (error) {

          status.textContent =
            `Unable to load chapters: ${error?.message || error}`
        }
      }


      async function loadVerses() {

        if (!chapterSelect.value) {
          setSelectLoading(
            startSelect,
            'Choose chapter'
          )
          setSelectLoading(
            endSelect,
            'Choose chapter'
          )
          return
        }


        status.textContent =
          'Loading verses...'


        try {

          verseList =
            await getBibleVerses({
              language:
                languageSelect.value,
              chapterId:
                chapterSelect.value
            })


          fillSelect(
            startSelect,
            verseList,
            item => item.id,
            item => item.number,
            'From verse'
          )

          fillSelect(
            endSelect,
            verseList,
            item => item.id,
            item => item.number,
            'To verse'
          )


          const startValue =
            current.startVerseId

          const endValue =
            current.endVerseId


          if (
            startValue &&
            verseList.some(
              verse =>
                verse.id === startValue
            )
          ) {
            startSelect.value =
              startValue
          }


          if (
            endValue &&
            verseList.some(
              verse =>
                verse.id === endValue
            )
          ) {
            endSelect.value =
              endValue
          } else if (
            startSelect.value
          ) {
            endSelect.value =
              startSelect.value
          }


          status.textContent =
            ''

        } catch (error) {

          status.textContent =
            `Unable to load verses: ${error?.message || error}`
        }
      }


      loadBooks()
    }
  )
}


function createLanguageTabsMarkup(
  reading
) {

  const normalized =
    normalizeScriptureReading(
      reading
    )

  const initial =
    hasTranslation(
      normalized,
      normalized.selectedLanguage
    )
      ? normalized.selectedLanguage
      : getFirstAvailableLanguage(
          normalized
        )


  return `
    <div data-scripture-language-area>
      ${createReaderLanguageTabs(
        normalized,
        initial
      )}
    </div>
  `
}


function createReaderLanguageTabs(
  reading,
  initialLanguage,
  options = {}
) {

  const collapsible =
    options.collapsible === true

  const collapsedInitially =
    collapsible &&
    options.collapsedInitially === true


  const availableLanguages =
    LANGUAGES.filter(
      language =>
        hasTranslation(
          reading,
          language.id
        )
    )


  const buttons =
    availableLanguages
      .map(
        language => {

          const isActive =
            !collapsedInitially &&
            language.id === initialLanguage

          return `
          <button
            type="button"
            data-scripture-reader-tab="${language.id}"
            aria-expanded="${isActive ? 'true' : 'false'}"
            style="
              padding:7px 11px;
              margin:0;
              line-height:1.2;
              font-weight:${isActive ? '700' : '600'};
              color:#ffffff;
              background:${isActive ? '#0753a6' : '#0d6efd'};
              border:1px solid ${isActive ? '#06478d' : '#0b5ed7'};
              border-radius:7px;
              cursor:pointer;
            "
          >
            ${language.label}
          </button>
        `
        }
      )
      .join('')


  if (!buttons) {

    return `
      <div
        style="
          margin-top:8px;
          color:#666;
          text-align:left;
        "
      >
        Select a Bible passage to load Urdu, Danish and English.
      </div>
    `
  }


  const initialContent =
    reading.translations[
      initialLanguage
    ] ||
    reading.translations[
      availableLanguages[0].id
    ] ||
    {
      reference: '',
      text: ''
    }


  const initialIsUrdu =
    initialLanguage === 'urdu'


  const initialDirection =
    initialIsUrdu
      ? 'rtl'
      : 'ltr'


  const initialAlignment =
    initialIsUrdu
      ? 'right'
      : 'left'


  const sections =
    availableLanguages
      .map(
        language => {

          const content =
            reading.translations[
              language.id
            ]

          const isUrdu =
            language.id === 'urdu'

          const direction =
            isUrdu
              ? 'rtl'
              : 'ltr'

          const alignment =
            isUrdu
              ? 'right'
              : 'left'

          const isVisible =
            !collapsedInitially &&
            language.id === initialLanguage

          return `
            <div
              data-scripture-reader-language="${language.id}"
              data-scripture-reference="${escapeHtml(content.reference)}"
              class="${isUrdu ? 'urdu-text' : ''}"
              dir="${direction}"
              style="
                display:${isVisible ? 'block' : 'none'};
                width:100%;
                box-sizing:border-box;
                margin:8px 0 0 0 !important;
                padding:0 !important;
                white-space:normal;
                line-height:${isUrdu ? '1.75' : '1.45'};
                direction:${direction} !important;
                text-align:${alignment} !important;
              "
            >
              <div
                dir="${direction}"
                style="
                  display:block;
                  width:100%;
                  box-sizing:border-box;
                  margin:0 !important;
                  padding:0 !important;
                  line-height:${isUrdu ? '1.75' : '1.45'};
                  direction:${direction} !important;
                  text-align:${alignment} !important;
                "
              >${escapeHtml(content.text)}</div>
            </div>
          `
        }
      )
      .join('')


  return `
    <div
      style="
        display:flex;
        gap:6px;
        flex-wrap:wrap;
        margin:0;
        padding:0;
      "
    >
      ${buttons}
    </div>

    <div
      data-scripture-active-reference
      class="${initialIsUrdu ? 'urdu-text' : ''}"
      dir="${initialDirection}"
      style="
        display:${collapsedInitially ? 'none' : 'block'};
        width:100%;
        box-sizing:border-box;
        margin:8px 0 0 0 !important;
        padding:0 !important;
        font-weight:700;
        line-height:${initialIsUrdu ? '1.7' : '1.35'};
        direction:${initialDirection} !important;
        text-align:${initialAlignment} !important;
      "
    >${escapeHtml(initialContent.reference)}</div>

    ${sections}
  `
}


function setReaderButtonState(
  button,
  active
) {

  button.style.fontWeight =
    active
      ? '700'
      : '600'

  button.style.background =
    active
      ? '#0753a6'
      : '#0d6efd'

  button.style.borderColor =
    active
      ? '#06478d'
      : '#0b5ed7'

  button.style.color =
    '#ffffff'

  button.setAttribute(
    'aria-expanded',
    active
      ? 'true'
      : 'false'
  )
}

function updateScriptureActiveLanguage(
  container,
  language
) {

  const activeSection =
    container.querySelector(
      `[data-scripture-reader-language="${cssEscape(language)}"]`
    )


  const reference =
    container.querySelector(
      '[data-scripture-active-reference]'
    )


  if (!reference) {
    return
  }


  const isUrdu =
    language === 'urdu'


  const direction =
    isUrdu
      ? 'rtl'
      : 'ltr'


  const alignment =
    isUrdu
      ? 'right'
      : 'left'


  reference.textContent =
    activeSection?.dataset
      ?.scriptureReference ||
    ''


  reference.dir =
    direction


  reference.classList.toggle(
    'urdu-text',
    isUrdu
  )


  reference.style.direction =
    direction


  reference.style.textAlign =
    alignment


  reference.style.lineHeight =
    isUrdu
      ? '1.7'
      : '1.35'
}


function bindCardTabs(
  card
) {

  card
    .querySelectorAll(
      '[data-scripture-reader-tab]'
    )
    .forEach(
      button => {

        if (
          button.dataset.bound === 'true'
        ) {
          return
        }


        button.dataset.bound =
          'true'


        button.addEventListener(
          'click',
          () => {

            const language =
              button.dataset
                .scriptureReaderTab


            card
              .querySelectorAll(
                '[data-scripture-reader-tab]'
              )
              .forEach(
                tab => {
                  setReaderButtonState(
                    tab,
                    tab === button
                  )
                }
              )


            card
              .querySelectorAll(
                '[data-scripture-reader-language]'
              )
              .forEach(
                section => {
                  section.style.display =
                    section.dataset
                      .scriptureReaderLanguage === language
                      ? 'block'
                      : 'none'
                }
              )


            const reference =
              card.querySelector(
                '[data-scripture-active-reference]'
              )

            if (reference) {
              reference.style.display =
                'block'
            }

            updateScriptureActiveLanguage(
              card,
              language
            )
          }
        )
      }
    )
}


function createPassageId(
  startId,
  endId
) {

  if (!startId) {
    return ''
  }


  if (
    !endId ||
    startId === endId
  ) {
    return startId
  }


  return `${startId}-${endId}`
}


function fillSelect(
  select,
  items,
  getValue,
  getLabel,
  placeholder
) {

  select.innerHTML =
    `<option value="">${escapeHtml(placeholder)}</option>` +
    items
      .map(
        item => `
          <option value="${escapeHtml(getValue(item))}">
            ${escapeHtml(getLabel(item))}
          </option>
        `
      )
      .join('')
}


function setSelectLoading(
  select,
  text
) {

  select.innerHTML =
    `<option value="">${escapeHtml(text)}</option>`
}


function hasReading(
  reading
) {

  return Boolean(
    reading?.passageId ||
    getReadingReference(
      reading
    ) ||
    LANGUAGES.some(
      language =>
        reading?.translations?.[
          language.id
        ]?.text
    )
  )
}


function hasTranslation(
  reading,
  language
) {

  const translation =
    reading?.translations?.[
      language
    ]


  return Boolean(
    translation?.reference ||
    translation?.text
  )
}


function getFirstAvailableLanguage(
  reading
) {

  return (
    LANGUAGES.find(
      language =>
        hasTranslation(
          reading,
          language.id
        )
    )?.id ||
    'urdu'
  )
}


function getReadingReference(
  reading
) {

  return (
    reading?.translations?.urdu?.reference ||
    reading?.translations?.danish?.reference ||
    reading?.translations?.english?.reference ||
    reading?.reference ||
    ''
  )
}


function normalizeTranslation(
  translation = {}
) {

  return {
    reference:
      String(
        translation?.reference ||
        ''
      ).trim(),

    text:
      String(
        translation?.text ||
        ''
      ).trim()
  }
}


function normalizeLanguage(
  value
) {

  const language =
    String(
      value ||
      ''
    ).toLowerCase()


  return LANGUAGES.some(
    item =>
      item.id === language
  )
    ? language
    : 'urdu'
}


function getBookIdFromPassage(
  passageId
) {

  return String(
    passageId ||
    ''
  )
    .split('.')[0] ||
    ''
}


function getChapterIdFromPassage(
  passageId
) {

  const first =
    String(
      passageId ||
      ''
    )
      .split('-')[0]

  const parts =
    first.split('.')


  if (
    parts.length < 2
  ) {
    return ''
  }


  return `${parts[0]}.${parts[1]}`
}


function getStartVerseId(
  passageId
) {

  return String(
    passageId ||
    ''
  )
    .split('-')[0] ||
    ''
}


function getEndVerseId(
  passageId
) {

  const value =
    String(
      passageId ||
      ''
    )


  if (!value) {
    return ''
  }


  return value.includes('-')
    ? value.split('-').pop()
    : value
}


function cssEscape(
  value
) {

  if (
    globalThis.CSS?.escape
  ) {
    return globalThis.CSS.escape(
      String(value)
    )
  }


  return String(value)
    .replace(
      /["\\]/g,
      '\\$&'
    )
}


function escapeHtml(
  value
) {

  return String(
    value ??
    ''
  )
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
