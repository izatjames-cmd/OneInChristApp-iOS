export function inputField(
  label,
  id,
  type,
  value
) {

  return `
    <label>
      ${label}
    </label>

    <input
      id="${id}"
      type="${type}"
      value="${escapeHtml(value)}"
      style="width:100%; padding:10px; margin-bottom:12px; box-sizing:border-box;"
    >
  `
}


export function inputOnly(
  label,
  id,
  value
) {

  return `
    <input
      id="${id}"
      type="text"
      placeholder="${label}"
      value="${escapeHtml(value)}"
      style="width:100%; padding:10px; margin-bottom:12px; box-sizing:border-box;"
    >
  `
}


export function textareaField(
  label,
  id,
  value,
  className = ''
) {

  return `
    <label>
      ${label}
    </label>

    <textarea
      id="${id}"
      class="${className}"
      rows="5"
      style="width:100%; padding:10px; margin-bottom:12px; box-sizing:border-box;"
    >${escapeHtml(value)}</textarea>
  `
}


export function referenceRow(
  reference = {}
) {

  return `
    <div
      data-additional-reference-row
      style="display:grid; grid-template-columns:1fr 90px 1fr; gap:8px;"
    >
      <input
        data-reference-book
        type="text"
        placeholder="Book"
        value="${escapeHtml(reference.book || '')}"
        style="width:100%; padding:10px; margin-bottom:8px; box-sizing:border-box;"
      >

      <input
        data-reference-chapter
        type="text"
        placeholder="Chapter"
        value="${escapeHtml(reference.chapter || '')}"
        style="width:100%; padding:10px; margin-bottom:8px; box-sizing:border-box;"
      >

      <input
        data-reference-verse
        type="text"
        placeholder="Verse"
        value="${escapeHtml(reference.verse || '')}"
        style="width:100%; padding:10px; margin-bottom:8px; box-sizing:border-box;"
      >
    </div>
  `
}


function escapeHtml(
  value
) {

  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
