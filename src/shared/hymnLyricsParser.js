const URDU_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/


export function isUrduScriptLine(
  value
) {

  return URDU_SCRIPT.test(
    String(
      value || ''
    )
  )
}


export function extractHymnFromDocument(
  doc,
  sourcePath = ''
) {

  if (!doc) {
    return null
  }


  const urduTitle =
    doc.querySelector(
      '.urdu-title'
    )
      ?.textContent
      ?.replace(
        /\s+/g,
        ' '
      )
      ?.trim() ||
    ''


  const romanTitle =
    doc.querySelector(
      '.roman-title'
    )
      ?.textContent
      ?.replace(
        /\s+/g,
        ' '
      )
      ?.trim() ||
    ''


  const sections =
    Array.from(
      doc.querySelectorAll(
        'main.page .section'
      )
    )


  const blocks =
    sections
      .map(
        (
          section,
          index
        ) => {

          const label =
            section.querySelector(
              '.section-label'
            )
              ?.textContent
              ?.replace(
                /\s+/g,
                ' '
              )
              ?.trim() ||
            `Verse ${index + 1}`

          const urdu =
            readBlockText(
              section.querySelector(
                '.urdu-block'
              )
            )

          const roman =
            readBlockText(
              section.querySelector(
                '.roman-block'
              )
            )


          return [
            label,
            urdu,
            roman
          ]
            .filter(Boolean)
            .join('\n')
        }
      )
      .filter(Boolean)


  const path =
    normalizePath(
      sourcePath
    )


  return {
    type:
      path
        .toLowerCase()
        .includes(
          '/zaboor/'
        )
        ? 'zaboor'
        : 'geet',

    sourceType:
      'built-in',

    sourcePath:
      path,

    urduTitle,
    romanTitle,

    content:
      blocks.join(
        '\n\n'
      )
  }
}


export function parseCombinedLyrics({
  content,
  urduTitle = '',
  romanTitle = ''
}) {

  let lines =
    String(
      content || ''
    )
      .replace(
        /\r\n?/g,
        '\n'
      )
      .split('\n')
      .map(
        line =>
          line.trim()
      )


  lines =
    stripRepeatedTitleLines(
      lines,
      urduTitle,
      romanTitle
    )


  const sections = []

  let current = {
    label: '',
    lines: []
  }


  const flush =
    () => {

      if (!current.lines.length) {
        current = {
          label: '',
          lines: []
        }

        return
      }


      sections.push({
        label:
          current.label,
        lines:
          [...current.lines]
      })


      current = {
        label: '',
        lines: []
      }
    }


  lines.forEach(
    line => {

      if (!line) {
        flush()
        return
      }


      if (
        isSectionHeading(
          line
        )
      ) {

        flush()

        current.label =
          normalizeSectionHeading(
            line
          )

        return
      }


      current.lines.push(
        line
      )
    }
  )


  flush()


  if (!sections.length) {
    return [
      {
        label:
          'Verse 1',
        lines: []
      }
    ]
  }


  let verseNumber = 1


  return sections.map(
    section => {

      if (section.label) {
        return section
      }


      const label =
        `Verse ${verseNumber}`


      verseNumber += 1


      return {
        ...section,
        label
      }
    }
  )
}


function readBlockText(
  element
) {

  if (!element) {
    return ''
  }


  const clone =
    element.cloneNode(
      true
    )


  clone
    .querySelectorAll(
      'br'
    )
    .forEach(
      br =>
        br.replaceWith(
          '\n'
        )
    )


  return String(
    clone.textContent || ''
  )
    .split('\n')
    .map(
      line =>
        line.trim()
    )
    .filter(Boolean)
    .join('\n')
}


function stripRepeatedTitleLines(
  lines,
  urduTitle,
  romanTitle
) {

  const result =
    [...lines]

  const firstNonEmpty =
    () =>
      result.findIndex(
        line =>
          Boolean(line)
      )


  const removeIfSame =
    value => {

      if (!value) {
        return
      }


      const index =
        firstNonEmpty()


      if (index < 0) {
        return
      }


      if (
        normalizeComparable(
          result[index]
        ) ===
        normalizeComparable(
          value
        )
      ) {

        result.splice(
          index,
          1
        )
      }
    }


  removeIfSame(
    urduTitle
  )

  removeIfSame(
    romanTitle
  )


  while (
    result.length &&
    !result[0]
  ) {
    result.shift()
  }


  return result
}


function isSectionHeading(
  line
) {

  const value =
    String(
      line || ''
    ).trim()


  return /^(verse\s*\d+|chorus|refrain|bridge|pre[- ]?chorus|intro|ending|outro)$/i
    .test(
      value
    )
}


function normalizeSectionHeading(
  line
) {

  const value =
    String(
      line || ''
    ).trim()


  if (
    /^verse\s*\d+$/i.test(
      value
    )
  ) {

    const number =
      value.match(
        /\d+/
      )?.[0]


    return `Verse ${number}`
  }


  if (
    /^pre[- ]?chorus$/i.test(
      value
    )
  ) {
    return 'Pre-Chorus'
  }


  return value
    .charAt(0)
    .toUpperCase() +
    value.slice(1)
      .toLowerCase()
}


function normalizeComparable(
  value
) {

  return String(
    value || ''
  )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .toLocaleLowerCase()
}


function normalizePath(
  value
) {

  const path =
    String(value || '')
      .trim()


  if (!path) {
    return ''
  }


  return path.startsWith('/')
    ? path
    : `/${path}`
}
