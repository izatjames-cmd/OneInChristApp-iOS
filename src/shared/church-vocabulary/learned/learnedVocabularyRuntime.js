import {
  getLearnedVocabularyEntries
} from './learnedVocabularyCache.js'

import {
  normalizeLanguageKey
} from '../terminologyNormalizer.js'


export function getLearnedSpeechPhrases(
  language
) {

  const key =
    normalizeLanguageKey(
      language
    )


  if (!key) {
    return []
  }


  const phrases =
    new Set()


  getLearnedVocabularyEntries()
    .forEach(
      entry => {

        const preferred =
          String(
            entry?.preferred?.[key] ||
            ''
          ).trim()


        if (preferred) {
          phrases.add(
            preferred
          )
        }


        if (
          normalizeLanguageKey(
            entry?.sourceLanguage
          ) === key
        ) {

          const sourceTerm =
            String(
              entry?.sourceTerm ||
              ''
            ).trim()


          if (sourceTerm) {
            phrases.add(
              sourceTerm
            )
          }
        }


        ;(
          entry?.aliases?.[key] ||
          []
        )
          .map(
            value =>
              String(
                value || ''
              ).trim()
          )
          .filter(Boolean)
          .forEach(
            value =>
              phrases.add(
                value
              )
          )
      }
    )


  return Array.from(
    phrases
  )
}


export function normalizeLearnedChurchTerminology(
  text,
  language,
  {
    sourceText = '',
    sourceLanguage = ''
  } = {}
) {

  const targetLanguage =
    normalizeLanguageKey(
      language
    )

  const normalizedSourceLanguage =
    normalizeLanguageKey(
      sourceLanguage
    )

  let value =
    String(
      text || ''
    ).trim()


  if (
    !value ||
    !targetLanguage
  ) {
    return value
  }


  getLearnedVocabularyEntries()
    .forEach(
      entry => {

        const preferred =
          String(
            entry?.preferred?.[
              targetLanguage
            ] || ''
          ).trim()


        if (!preferred) {
          return
        }


        const aliases =
          new Set(
            (
              entry?.aliases?.[
                targetLanguage
              ] ||
              []
            )
              .map(
                alias =>
                  String(
                    alias || ''
                  ).trim()
              )
              .filter(Boolean)
          )


        if (
          normalizedSourceLanguage &&
          normalizeLanguageKey(
            entry?.sourceLanguage
          ) === normalizedSourceLanguage &&
          containsText(
            sourceText,
            entry?.sourceTerm,
            normalizedSourceLanguage
          )
        ) {

          const sourceTerm =
            String(
              entry?.sourceTerm || ''
            ).trim()


          if (sourceTerm) {
            aliases.add(
              sourceTerm
            )
          }
        }


        aliases.forEach(
          alias => {
            value =
              replaceText(
                value,
                alias,
                preferred,
                targetLanguage
              )
          }
        )
      }
    )


  return value.trim()
}


export function searchLearnedChurchVocabulary(
  query,
  language,
  {
    limit = 20
  } = {}
) {

  const key =
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
    !key ||
    !search
  ) {
    return []
  }


  const matches = []


  getLearnedVocabularyEntries()
    .forEach(
      entry => {

        const values = [
          entry?.preferred?.[key],
          ...(
            entry?.aliases?.[key] ||
            []
          )
        ]


        if (
          normalizeLanguageKey(
            entry?.sourceLanguage
          ) === key
        ) {
          values.push(
            entry?.sourceTerm
          )
        }


        values
          .map(
            value =>
              String(
                value || ''
              ).trim()
          )
          .filter(Boolean)
          .forEach(
            value => {

              if (
                value
                  .toLocaleLowerCase()
                  .includes(
                    search
                  )
              ) {
                matches.push(
                  value
                )
              }
            }
          )
      }
    )


  return [
    ...new Set(
      matches
    )
  ]
    .slice(
      0,
      Math.max(
        1,
        Number(limit) || 20
      )
    )
}


function containsText(
  text,
  search,
  language
) {

  const value =
    String(
      text || ''
    )

  const needle =
    String(
      search || ''
    ).trim()


  if (!needle) {
    return false
  }


  return wholeTermPattern(needle).test(value)
}


function replaceText(
  text,
  search,
  replacement,
  language
) {

  const needle =
    String(
      search || ''
    ).trim()


  if (!needle) {
    return text
  }


  return String(text)
    .replace(
      wholeTermPattern(needle),
      () => replacement
    )
}

function wholeTermPattern(needle) {
  return new RegExp(`(?<![\\p{L}\\p{M}\\p{N}_])${escapeRegExp(needle)}(?![\\p{L}\\p{M}\\p{N}_])`, 'giu')
}

function escapeRegExp(
  value
) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  )
}
