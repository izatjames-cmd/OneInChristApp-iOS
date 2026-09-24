/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Daily Devotion
 * File   : dailyDevotionVocabulary.js
 *
 * Purpose:
 * Applies the shared church vocabulary to generated devotional
 * language while preserving Bible reference and verse text exactly.
 * ============================================================
 */

import {
  normalizeChurchTerminology
} from '../shared/church-vocabulary/churchVocabulary.js'


export function applyDailyDevotionVocabulary(
  devotion
) {

  if (!devotion) {
    return devotion
  }


  const english =
    normalizeDevotionLanguage({
      content:
        devotion,
      language:
        'english'
    })


  const translations = {
    ...(devotion.translations || {})
  }


  ;[
    'danish',
    'urdu'
  ].forEach(
    language => {

      const content =
        devotion.translations?.[
          language
        ]


      if (!content) {
        return
      }


      translations[language] =
        normalizeDevotionLanguage({
          content,
          language,
          sourceContent:
            devotion,
          sourceLanguage:
            'english'
        })
    }
  )


  return {
    ...devotion,
    ...english,
    translations
  }
}


export function normalizeDevotionLanguage({
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

    // Scripture is intentionally preserved exactly as supplied
    // by the Bible source / generated record.
    verseReference:
      content.verseReference || '',

    verseText:
      content.verseText || '',

    explanation:
      normalizeField({
        value:
          content.explanation,
        language,
        sourceValue:
          sourceContent?.explanation,
        sourceLanguage
      }),

    application:
      normalizeField({
        value:
          content.application,
        language,
        sourceValue:
          sourceContent?.application,
        sourceLanguage
      }),

    prayer:
      normalizeField({
        value:
          content.prayer,
        language,
        sourceValue:
          sourceContent?.prayer,
        sourceLanguage
      })
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
