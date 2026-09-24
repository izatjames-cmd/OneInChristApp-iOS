import {
  getChurchSpeechPhrases
} from '../../shared/church-vocabulary/churchVocabulary.js'

import {
  getStopWords
} from './stop-words/index.js'

import {
  normalizeVocabularyText,
  tokenizeText
} from './tokenizeText.js'


export function extractVocabularyCandidates({
  segments,
  sourceLanguage,
  limit = 30
}) {

  const language =
    String(
      sourceLanguage || ''
    ).trim()


  if (!language) {
    return []
  }


  const known =
    new Set(
      getChurchSpeechPhrases(
        language
      )
        .map(
          phrase =>
            normalizeVocabularyText(
              phrase,
              language
            )
        )
        .filter(Boolean)
    )

  const stopWords =
    getStopWords(
      language
    )

  const candidates =
    new Map()


  ;(
    Array.isArray(segments)
      ? segments
      : []
  )
    .forEach(
      segment => {

        const sourceText =
          String(
            segment?.sourceText || ''
          ).trim()


        if (!sourceText) {
          return
        }


        const tokens =
          tokenizeText(
            sourceText,
            language
          )


        addSingleWordCandidates({
          tokens,
          sourceText,
          language,
          known,
          stopWords,
          candidates
        })


        addPhraseCandidates({
          tokens,
          sourceText,
          language,
          known,
          stopWords,
          candidates
        })
      }
    )


  return Array.from(
    candidates.values()
  )
    .filter(
      candidate =>
        candidate.frequency >= 2
    )
    .sort(
      (
        first,
        second
      ) =>
        scoreCandidate(second) -
        scoreCandidate(first)
    )
    .slice(
      0,
      Math.max(
        1,
        Number(limit) || 30
      )
    )
}


function addSingleWordCandidates({
  tokens,
  sourceText,
  language,
  known,
  stopWords,
  candidates
}) {

  tokens.forEach(
    token => {

      const normalized =
        token.normalized


      if (
        stopWords.has(normalized) ||
        known.has(normalized) ||
        normalized.length < minimumWordLength(
          language
        )
      ) {
        return
      }


      addCandidate({
        key:
          normalized,
        phrase:
          token.original,
        wordCount:
          1,
        context:
          sourceText,
        candidates
      })
    }
  )
}


function addPhraseCandidates({
  tokens,
  sourceText,
  language,
  known,
  stopWords,
  candidates
}) {

  for (
    let size = 2;
    size <= 3;
    size += 1
  ) {

    for (
      let index = 0;
      index <= tokens.length - size;
      index += 1
    ) {

      const slice =
        tokens.slice(
          index,
          index + size
        )

      const first =
        slice[0]?.normalized || ''

      const last =
        slice[
          slice.length - 1
        ]?.normalized || ''


      if (
        stopWords.has(first) ||
        stopWords.has(last)
      ) {
        continue
      }


      const phrase =
        slice
          .map(
            token =>
              token.original
          )
          .join(' ')

      const normalized =
        normalizeVocabularyText(
          phrase,
          language
        )


      if (
        !normalized ||
        known.has(normalized)
      ) {
        continue
      }


      addCandidate({
        key:
          normalized,
        phrase,
        wordCount:
          size,
        context:
          sourceText,
        candidates
      })
    }
  }
}


function addCandidate({
  key,
  phrase,
  wordCount,
  context,
  candidates
}) {

  const existing =
    candidates.get(
      key
    )


  if (existing) {
    existing.frequency += 1
    return
  }


  candidates.set(
    key,
    {
      sourceTerm:
        phrase,
      normalizedTerm:
        key,
      frequency:
        1,
      wordCount,
      context:
        String(
          context || ''
        ).slice(
          0,
          240
        )
    }
  )
}


function scoreCandidate(
  candidate
) {

  return (
    Number(
      candidate?.frequency || 0
    ) * 20
  ) + (
    Number(
      candidate?.wordCount || 0
    ) * 6
  ) + Math.min(
    20,
    String(
      candidate?.sourceTerm || ''
    ).length
  )
}


function minimumWordLength(
  language
) {
  return language === 'urdu'
    ? 3
    : 4
}
