import {
  DANISH_CHRISTIAN_PHRASES,
  DANISH_CHRISTIAN_TRANSLATION_RULES
} from './danish/index.js'

import {
  ENGLISH_CHRISTIAN_PHRASES,
  ENGLISH_CHRISTIAN_TRANSLATION_RULES
} from './english/index.js'

import {
  URDU_CHRISTIAN_PHRASES,
  URDU_CHRISTIAN_TRANSLATION_RULES
} from './urdu/index.js'

import {
  normalizeChurchTerminology as normalizeCoreChurchTerminology,
  normalizeLanguageKey
} from './terminologyNormalizer.js'

import {
  searchChurchVocabulary as searchCoreChurchVocabulary
} from './vocabularySearch.js'

import {
  loadLearnedChurchVocabulary,
  refreshLearnedChurchVocabulary
} from './learned/learnedVocabularyStore.js'

import {
  getLearnedSpeechPhrases,
  normalizeLearnedChurchTerminology,
  searchLearnedChurchVocabulary
} from './learned/learnedVocabularyRuntime.js'

const PHRASES_BY_LANGUAGE = {
  danish:
    DANISH_CHRISTIAN_PHRASES,

  english:
    ENGLISH_CHRISTIAN_PHRASES,

  urdu:
    URDU_CHRISTIAN_PHRASES
}

const RULES_BY_LANGUAGE = {
  danish:
    DANISH_CHRISTIAN_TRANSLATION_RULES,

  english:
    ENGLISH_CHRISTIAN_TRANSLATION_RULES,

  urdu:
    URDU_CHRISTIAN_TRANSLATION_RULES
}


export function getChurchSpeechPhrases(
  language
) {

  const key =
    normalizeLanguageKey(
      language
    )


  if (!key) {
    return []
  }


  return [
    ...new Set([
      ...(
        PHRASES_BY_LANGUAGE[
          key
        ] || []
      ),
      ...getLearnedSpeechPhrases(
        key
      )
    ])
  ]
}


export function getChurchTranslationRules(
  language
) {

  const key =
    normalizeLanguageKey(
      language
    )


  return key
    ? [
        ...(
          RULES_BY_LANGUAGE[
            key
          ] || []
        )
      ]
    : []
}


export function normalizeChurchTerminology(
  text,
  language,
  options = {}
) {

  const coreNormalized =
    normalizeCoreChurchTerminology(
      text,
      language,
      options
    )


  const learnedNormalized =
    normalizeLearnedChurchTerminology(
      coreNormalized,
      language,
      options
    )


  // Core church terminology is applied once more at the end so
  // approved learned vocabulary can extend the dictionary but can
  // never re-introduce non-Christian wording for protected terms.
  return normalizeCoreChurchTerminology(
    learnedNormalized,
    language,
    options
  )
}


export function searchChurchVocabulary(
  query,
  language,
  {
    limit = 20
  } = {}
) {

  const max =
    Math.max(
      1,
      Number(limit) || 20
    )

  const core =
    searchCoreChurchVocabulary(
      query,
      language,
      {
        limit:
          max
      }
    )

  const learned =
    searchLearnedChurchVocabulary(
      query,
      language,
      {
        limit:
          max
      }
    )


  return [
    ...new Set([
      ...core,
      ...learned
    ])
  ]
    .slice(
      0,
      max
    )
}


export {
  loadLearnedChurchVocabulary,
  refreshLearnedChurchVocabulary
}
