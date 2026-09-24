import {
  DANISH_CHRISTIAN_PHRASES
} from './danish/index.js'

import {
  ENGLISH_CHRISTIAN_PHRASES
} from './english/index.js'

import {
  URDU_CHRISTIAN_PHRASES
} from './urdu/index.js'

import {
  normalizeLanguageKey
} from './terminologyNormalizer.js'

const PHRASES_BY_LANGUAGE = {
  danish:
    DANISH_CHRISTIAN_PHRASES,

  english:
    ENGLISH_CHRISTIAN_PHRASES,

  urdu:
    URDU_CHRISTIAN_PHRASES
}

export function searchChurchVocabulary(
  query,
  language,
  {
    limit = 20
  } = {}
) {

  const languageKey =
    normalizeLanguageKey(
      language
    )

  const search =
    String(
      query || ''
    )
      .trim()
      .toLocaleLowerCase()


  if (
    !languageKey ||
    !search
  ) {
    return []
  }


  return (
    PHRASES_BY_LANGUAGE[
      languageKey
    ] || []
  )
    .filter(
      phrase =>
        String(phrase)
          .toLocaleLowerCase()
          .includes(search)
    )
    .slice(
      0,
      Math.max(
        1,
        Number(limit) || 20
      )
    )
}
