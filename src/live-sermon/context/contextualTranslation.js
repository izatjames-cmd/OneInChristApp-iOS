import { correctSurrenderRecipient } from './surrenderPhraseGrammar.js'

import {
  correctDanishPronouns
} from './danishPronounGrammar.js'

import {
  correctEnglishPronouns
} from './englishPronounGrammar.js'


export function applyContextualGrammar(
  text,
  targetLanguage,
  context = {}
) {

  const value =
    String(
      text || ''
    ).trim()


  if (
    !value ||
    context?.sourceLanguage !==
      'urdu' ||
    context?.ambiguous ===
      true ||
    context?.hasThirdPersonReference !==
      true ||
    !context?.focus
  ) {
    return value
  }


  const target =
    normalizeLanguageKey(
      targetLanguage
    )


  if (
    target === 'english'
  ) {
    return correctEnglishPronouns(
      correctSurrenderRecipient(value, target, context),
      context
    )
  }


  if (
    target === 'danish'
  ) {
    return correctDanishPronouns(
      correctSurrenderRecipient(value, target, context),
      context
    )
  }


  return value
}


function normalizeLanguageKey(
  language
) {

  const value =
    String(
      language || ''
    )
      .trim()
      .toLowerCase()


  if (
    value === 'english' ||
    value === 'en' ||
    value === 'en-gb' ||
    value === 'en-us'
  ) {
    return 'english'
  }


  if (
    value === 'danish' ||
    value === 'dansk' ||
    value === 'da' ||
    value === 'da-dk'
  ) {
    return 'danish'
  }


  if (
    value === 'urdu' ||
    value === 'ur' ||
    value === 'ur-in' ||
    value === 'ur-pk'
  ) {
    return 'urdu'
  }


  return ''
}
