import {
  scriptureReadingCard
} from '../shared/scripturePassage.js'

import {
  createApostlesCreedMarkup,
  bindApostlesCreed
} from '../shared/apostlesCreed.js'


export function renderServicePlanShell() {

  if (
    document.querySelector(
      '#service-plan-overlay'
    )
  ) {
    return
  }


  const overlay =
    document.createElement(
      'div'
    )


  overlay.id =
    'service-plan-overlay'

  overlay.style.position =
    'fixed'

  overlay.style.inset =
    '0'

  overlay.style.zIndex =
    '50000'

  overlay.style.background =
    '#fffdf8'

  overlay.style.overflow =
    'auto'

  overlay.style.display =
    'none'


  overlay.innerHTML = `
    <div
      style="
        max-width:800px;
        margin:0 auto;
        padding:16px;
        box-sizing:border-box;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:18px;
        "
      >

        <h2 style="margin:0;">
          Service Plan
        </h2>

        <button
          id="close-service-plan-button"
          type="button"
        >
          Close
        </button>

      </div>

      <div
        id="service-plan-admin-area"
      ></div>

      <div
        id="service-plan-content"
      ></div>

      <button
        id="close-service-plan-bottom-button"
        type="button"
        style="
          width:100%;
          padding:12px;
          margin-top:18px;
        "
      >
        Close
      </button>

    </div>
  `


  document.body.appendChild(
    overlay
  )


  renderServicePlanEditorShell()
}


function renderServicePlanEditorShell() {

  const overlay =
    document.createElement(
      'div'
    )


  overlay.id =
    'service-plan-editor-overlay'

  overlay.style.position =
    'fixed'

  overlay.style.inset =
    '0'

  overlay.style.zIndex =
    '60000'

  overlay.style.background =
    '#ffffff'

  overlay.style.overflow =
    'auto'

  overlay.style.display =
    'none'


  overlay.innerHTML = `
    <div
      style="
        max-width:800px;
        margin:0 auto;
        padding:16px;
        box-sizing:border-box;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:18px;
        "
      >

        <h2
          id="service-plan-editor-heading"
          style="margin:0;"
        >
          Create Service Plan
        </h2>

        <button
          id="close-service-plan-editor-button"
          type="button"
        >
          Close
        </button>

      </div>


      <form
        id="service-plan-form"
      >

        <label>
          Service Title
        </label>

        <input
          id="service-plan-title"
          type="text"
          value="Sunday Service"
          required
        >


        <label>
          Date
        </label>

        <input
          id="service-plan-date"
          type="date"
          required
        >


        <label>
          Time
        </label>

        <input
          id="service-plan-time"
          type="time"
        >


        <label>
          Load hymns from Choir Plan
        </label>

        <select
          id="service-plan-choir-plan"
        >
          <option value="">
            Choose a choir plan
          </option>
        </select>


        <label>
          Load scripture from Scripture Preparation
        </label>

        <select
          id="service-plan-scripture-preparation"
        >
          <option value="">
            Choose scripture preparation
          </option>
        </select>


        <label
          style="
            display:flex;
            align-items:center;
            gap:8px;
            margin:15px 0;
          "
        >

          <input
            id="service-plan-active"
            type="checkbox"
            checked
          >

          Published

        </label>


        ${textSection(
          'Welcome',
          'welcome'
        )}


        ${scriptureReadingCard({
          label:
            'Opening Reading',
          id:
            'opening-reading',
          allowSelect:
            true
        })}


        ${textSection(
          'Prayer',
          'opening-prayer'
        )}


        ${hymnSection(
          'First Hymn',
          'hymn1'
        )}


        ${hymnSection(
          'Second Hymn',
          'hymn2'
        )}


        ${scriptureReadingCard({
          label:
            'Reading 1',
          id:
            'reading1',
          allowSelect:
            true
        })}


        ${textSection(
          'Prayer',
          'middle-prayer'
        )}


        ${hymnSection(
          'Third Hymn',
          'hymn3'
        )}


        ${scriptureReadingCard({
          label:
            'Reading 2',
          id:
            'reading2',
          allowSelect:
            true
        })}


        ${hymnSection(
          'Hymn number four',
          'hymn4'
        )}


        ${createApostlesCreedMarkup({
          id: 'service-plan-editor-apostles-creed',
          collapsedInitially: true,
          sectionTitle: "Apostles' Creed (Permanent)"
        })}


        ${hymnSection(
          'Holy Spirit Hymn',
          'holy-spirit-hymn'
        )}


        ${textSection(
          'Prayer',
          'prayer-after-holy-spirit'
        )}


        ${sermonSection()}


        <section class="service-plan-section">
          <h3>Extra References</h3>

          <div
            id="service-plan-extra-references"
          >
            <p style="color:#666;">
              Load Scripture Preparation to include extra references.
            </p>
          </div>

          <textarea
            id="service-plan-extra-references-data"
            style="display:none;"
          >[]</textarea>
        </section>


        ${hymnSection(
          'Hymn number five',
          'hymn5'
        )}


        ${titleSection(
          'Closing Prayers'
        )}


        ${titleSection(
          'Blessings'
        )}


        ${textSection(
          'Information',
          'information'
        )}


        <div
          id="service-plan-status"
          style="
            margin:15px 0;
            min-height:20px;
          "
        ></div>


        <button
          id="save-service-plan-button"
          type="submit"
          style="
            width:100%;
            padding:13px;
            font-weight:bold;
            font-size:16px;
          "
        >
          Save Service Plan
        </button>

      </form>

    </div>
  `


  document.body.appendChild(
    overlay
  )

  bindApostlesCreed(
    overlay
  )
}


function singleReading(
  title,
  id,
  language
) {

  const isUrdu =
    language === 'urdu'

  return `
    <section
      class="service-plan-section"
    >

      <h3>
        ${title}
      </h3>

      ${readingFields({
        id,
        language:
          language,
        title:
          isUrdu
            ? 'Urdu Bible Reading'
            : 'Danish Bible Reading',
        className:
          isUrdu
            ? 'urdu-text'
            : ''
      })}

    </section>
  `
}


function readingFields({
  id,
  language,
  title,
  className = ''
}) {

  const label =
    language === 'urdu'
      ? 'Urdu Bible Reference'
      : 'Danish Bible Reference'


  const button =
    language === 'urdu'
      ? 'Select Urdu Reading'
      : 'Select Danish Reading'


  return `
    <div
      style="
        border:1px solid #e5e5e5;
        border-radius:10px;
        padding:14px;
        margin-bottom:16px;
      "
    >

      <h4
        class="${className}"
        style="
          margin:0 0 12px;
          font-weight:bold;
        "
      >
        ${title}
      </h4>

      <label>
        ${label}
      </label>

      <input
        id="${id}-${language}-reference"
        type="text"
        class="${className}"
        placeholder="${label}"
      >

      <button
        type="button"
        class="select-bible-reading-button"
        data-bible-language="${language}"
        data-reading-id="${id}"
        style="
          width:100%;
          padding:11px;
          margin:5px 0 8px;
          font-weight:bold;
        "
      >
        ${button}
      </button>

      <div
        id="${id}-${language}-status"
        style="
          min-height:18px;
          margin-bottom:6px;
          font-size:13px;
        "
      ></div>

      <textarea
        id="${id}-${language}"
        class="${className}"
        rows="6"
        placeholder="Selected Bible verses will appear here"
      ></textarea>

    </div>
  `
}


function hymnSection(
  title,
  id
) {

  return `
    <section
      class="service-plan-section"
    >

      <h3>
        ${title}
      </h3>

      <label>
        Urdu Hymn Title
      </label>

      <input
        id="${id}-urdu-title"
        type="text"
        dir="rtl"
        class="urdu-text"
        style="text-align:right;"
      >

      <label>
        Roman Hymn Title
      </label>

      <input
        id="${id}-title"
        type="text"
      >

      <input
        id="${id}-lyrics-url"
        type="hidden"
      >

      <input
        id="${id}-lyrics-image-url"
        type="hidden"
      >

      <input
        id="${id}-lyrics-image-path"
        type="hidden"
      >

      <input
        id="${id}-source-type"
        type="hidden"
      >

    </section>
  `
}


function sermonSection() {

  return `
    <section
      class="service-plan-section"
    >

      <h3>
        Sermon
      </h3>

      <label>
        Sermon Title
      </label>

      <input
        id="sermon-title"
        type="text"
      >

      <label>
        Preacher
      </label>

      <input
        id="sermon-preacher"
        type="text"
      >

    </section>
  `
}


function titleSection(
  title
) {

  return `
    <section
      class="service-plan-section"
    >

      <h3>
        ${title}
      </h3>

    </section>
  `
}


function textSection(
  title,
  id,
  className = '',
  rows = 4
) {

  return `
    <section
      class="service-plan-section"
    >

      <h3>
        ${title}
      </h3>

      <textarea
        id="${id}"
        class="${className}"
        rows="${rows}"
      ></textarea>

    </section>
  `
}
