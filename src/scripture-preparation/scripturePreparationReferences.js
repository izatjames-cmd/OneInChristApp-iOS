import {
  scriptureReadingCard,
  getScriptureReading
} from '../shared/scripturePassage.js'


export function additionalReferenceRow(
  reference = {},
  index = 0
) {

  const id =
    `scripture-additional-reference-${index}`


  const numericIndex =
    Number(index)


  const displayNumber =
    Number.isInteger(numericIndex)
      ? numericIndex + 1
      : ''


  return `
    <div
      data-additional-reference-row
      data-reference-id="${escapeHtml(id)}"
    >
      ${scriptureReadingCard({
        label:
          displayNumber
            ? `Extra Reference ${displayNumber}`
            : 'Extra Reference',
        id,
        reading:
          reference,
        allowSelect:
          true,
        removable:
          true
      })}
    </div>
  `
}


export function getAdditionalReferences() {

  return Array.from(
    document.querySelectorAll(
      '[data-additional-reference-row]'
    )
  )
    .map(
      row => {

        const id =
          row.dataset
            .referenceId


        return getScriptureReading(
          id
        )
      }
    )
    .filter(
      reference =>
        Boolean(
          reference?.passageId ||
          reference?.reference ||
          reference?.urdu ||
          reference?.danish ||
          reference?.english
        )
    )
}


export function getReading(
  id
) {

  return getScriptureReading(
    id
  )
}


function escapeHtml(
  value
) {

  return String(
    value ||
    ''
  )
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
