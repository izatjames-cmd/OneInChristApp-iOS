import {
  escapeAttribute,
  escapeHtml
} from './hymnEditorUtils.js'


export function buildHymnEditorMarkup({
  hymn,
  isNew,
  typeLabel,
  sourceType
}) {

  return `
    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        flex-wrap:wrap;
        margin-bottom:16px;
      "
    >
      <div>
        <strong style="font-size:20px;">
          ${
            isNew
              ? 'Add New Geet'
              : `Edit ${typeLabel}`
          }
        </strong>

        ${
          sourceType === 'built-in'
            ? `
              <div
                style="
                  margin-top:4px;
                  color:#666;
                  font-size:12px;
                "
              >
                Original hymnbook file is protected. Saved corrections are stored separately.
              </div>
            `
            : ''
        }
      </div>

      <button
        type="button"
        data-editor-action="cancel"
        style="padding:9px 12px;"
      >
        Cancel
      </button>
    </div>

    <label>
      <strong>Urdu / Punjabi title</strong>
    </label>

    <input
      data-editor-field="urduTitle"
      type="text"
      dir="rtl"
      value="${escapeAttribute(
        hymn?.urduTitle || ''
      )}"
      placeholder="گیت یا زبور کا عنوان"
      style="
        width:100%;
        max-width:100%;
        min-width:0;
        box-sizing:border-box;
        padding:11px;
        margin:6px 0 14px;
        font-size:18px;
        font-family:'Noto Nastaliq Urdu', serif;
      "
    >

    <label>
      <strong>Roman title</strong>
    </label>

    <input
      data-editor-field="romanTitle"
      type="text"
      value="${escapeAttribute(
        hymn?.romanTitle || ''
      )}"
      placeholder="Roman title"
      style="
        width:100%;
        max-width:100%;
        min-width:0;
        box-sizing:border-box;
        padding:11px;
        margin:6px 0 14px;
      "
    >

    <label>
      <strong>Complete ${typeLabel}</strong>
    </label>

    <p
      style="
        margin:5px 0 8px;
        color:#555;
        font-size:13px;
        line-height:1.45;
      "
    >
      Urdu/Punjabi and Roman stay together in this one editor.
      You can select, copy, paste, or replace the whole song at once.
      Keep a blank line between sections and keep headings such as
      Verse 1, Verse 2, Chorus or Bridge when they are used.
    </p>

    <textarea
      data-editor-field="content"
      rows="22"
      dir="auto"
      spellcheck="false"
      style="
        width:100%;
        max-width:100%;
        min-width:0;
        box-sizing:border-box;
        overflow-wrap:anywhere;
        white-space:pre-wrap;
        padding:12px;
        margin:0 0 14px;
        line-height:1.8;
        resize:vertical;
        font-family:'Inter','Noto Nastaliq Urdu','Segoe UI',Arial,sans-serif;
      "
      placeholder="Verse 1\nاردو / پنجابی لائن\nRoman line\n\nVerse 2\nاردو / پنجابی لائن\nRoman line"
    >${escapeHtml(
      hymn?.content || ''
    )}</textarea>

    <div
      style="
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-bottom:10px;
      "
    >
      <button
        type="button"
        data-editor-action="preview"
        style="padding:10px 14px;"
      >
        Preview
      </button>

      <button
        type="button"
        data-editor-action="save"
        style="
          padding:10px 14px;
          font-weight:700;
        "
      >
        ${
          isNew
            ? 'Add Geet'
            : 'Save Changes'
        }
      </button>

      ${
        !isNew
          ? `
            <button
              type="button"
              data-editor-action="history"
              style="padding:10px 14px;"
            >
              Revision History
            </button>
          `
          : ''
      }

      ${
        sourceType === 'built-in' &&
        hymn?.isEdited === true
          ? `
            <button
              type="button"
              data-editor-action="restore-original"
              style="padding:10px 14px;"
            >
              Restore Original
            </button>
          `
          : ''
      }

      <button
        type="button"
        data-editor-action="cancel-bottom"
        style="padding:10px 14px;"
      >
        Cancel
      </button>
    </div>

    <div
      data-editor-status
      style="
        min-height:20px;
        font-size:13px;
        margin-bottom:10px;
      "
    ></div>

    <div
      data-editor-history-wrap
      style="display:none; margin:14px 0;"
    ></div>

    <div
      data-editor-preview-wrap
      style="display:none;"
    >
      <div
        style="
          font-weight:700;
          margin:10px 0 7px;
        "
      >
        Preview — final hymnbook layout
      </div>

      <iframe
        data-editor-preview
        title="Hymn preview"
        style="
          width:100%;
          max-width:100%;
          min-width:0;
          box-sizing:border-box;
          height:62vh;
          border:1px solid #dddddd;
          border-radius:8px;
          background:#ffffff;
        "
      ></iframe>
    </div>
  `
}
