/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingVocabulary.js
 *
 * Purpose:
 * Applies the shared church vocabulary to reflections and study
 * questions while preserving the Bible reference and verse text.
 * ============================================================
 */

import {
  normalizeChurchTerminology
} from '../shared/church-vocabulary/churchVocabulary.js'


export function applyAiBibleReadingVocabulary(
  reading
) {

  if (!reading) {
    return reading
  }


  const english =
    normalizeReadingLanguage({
      content:
        reading,
      language:
        'english'
    })


  const translations = {
    ...(reading.translations || {})
  }


  ;[
    'danish',
    'urdu'
  ].forEach(
    language => {

      const content =
        reading.translations?.[
          language
        ]


      if (!content) {
        return
      }


      translations[language] =
        normalizeReadingLanguage({
          content,
          language,
          sourceContent:
            reading,
          sourceLanguage:
            'english'
        })
    }
  )


  return {
    ...reading,
    ...english,
    translations
  }
}


export function normalizeReadingLanguage({
  content,
  language,
  sourceContent = null,
  sourceLanguage = ''
}) {

  if (!content) {
    return content
  }


  return {
    ...content,

    // Never rewrite the Bible reference or actual verse text.
    verseReference:
      content.verseReference || '',

    verseText:
      content.verseText || '',

    reflection:
      normalizeField({
        value:
          content.reflection,
        language,
        sourceValue:
          sourceContent?.reflection,
        sourceLanguage
      }),

    questions:
      Array.isArray(
        content.questions
      )
        ? content.questions.map(
            (
              question,
              index
            ) =>
              normalizeField({
                value:
                  question,
                language,
                sourceValue:
                  sourceContent?.questions?.[
                    index
                  ] || '',
                sourceLanguage
              })
          )
        : []
  }
}


function normalizeField({
  value,
  language,
  sourceValue = '',
  sourceLanguage = ''
}) {

  return normalizeChurchTerminology(
    value,
    language,
    {
      sourceText:
        sourceValue,
      sourceLanguage
    }
  )
}
