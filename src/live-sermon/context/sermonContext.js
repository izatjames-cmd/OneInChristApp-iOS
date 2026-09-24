import {
  detectExplicitReferents,
  hasAmbiguousThirdPersonReference,
  normalizeLanguageKey
} from './entityTracker.js'

import {
  analyzeUrduPronouns
} from './urduPronounProfile.js'


const DEFAULT_HISTORY_LIMIT =
  5

const DEFAULT_FOCUS_MAX_AGE =
  4


export function createSermonContext({
  historyLimit =
    DEFAULT_HISTORY_LIMIT,
  focusMaxAge =
    DEFAULT_FOCUS_MAX_AGE
} = {}) {

  let history = []
  let focus = null
  let focusAge = 0


  function reset() {
    history = []
    focus = null
    focusAge = 0
  }


  function observe(
    sourceText,
    sourceLanguage
  ) {

    const language =
      normalizeLanguageKey(
        sourceLanguage
      )

    const text =
      String(
        sourceText || ''
      ).trim()

    const explicitReferents =
      detectExplicitReferents(
        text,
        language
      )

    const distinctReferents =
      collapseTitleReferents(
        dedupeReferents(
          explicitReferents
        )
      )

    const pronouns =
      language === 'urdu'
        ? analyzeUrduPronouns(
            text
          )
        : {
            hasAny:
              false,
            subject:
              false,
            object:
              false,
            possessive:
              false,
            resolveSubjectOnly:
              false
          }

    const hasThirdPersonReference =
      hasAmbiguousThirdPersonReference(
        text,
        language
      ) ||
      pronouns.hasAny ===
        true

    let ambiguous =
      false


    if (
      distinctReferents.length ===
      1
    ) {

      focus = {
        ...distinctReferents[0]
      }

      focusAge =
        0

    } else if (
      distinctReferents.length >
      1
    ) {

      // A sentence such as "Jesus spoke to the disciples" has
      // more than one possible antecedent. Do not guess which one
      // a pronoun in the next sentence refers to.
      ambiguous =
        true

      focus =
        null

      focusAge =
        0

    } else if (focus) {

      focusAge +=
        1


      if (
        focusAge >
        focusMaxAge
      ) {
        focus =
          null
      }
    }


    const snapshot = {
      sourceText:
        text,
      sourceLanguage:
        language,
      focus:
        focus
          ? {
              ...focus
            }
          : null,
      focusAge,
      ambiguous,
      hasThirdPersonReference,
      pronouns: {
        ...pronouns
      },
      explicitReferents:
        distinctReferents.map(
          item => ({
            ...item
          })
        ),
      history:
        history.map(
          item => ({
            ...item,
            focus:
              item.focus
                ? {
                    ...item.focus
                  }
                : null
          })
        )
    }


    history.push({
      sourceText:
        text,
      sourceLanguage:
        language,
      focus:
        snapshot.focus,
      hadExplicitReferent:
        distinctReferents.length >
        0
    })


    history =
      history.slice(
        -Math.max(
          1,
          Number(
            historyLimit
          ) ||
            DEFAULT_HISTORY_LIMIT
        )
      )


    return snapshot
  }


  function getState() {
    return {
      focus:
        focus
          ? {
              ...focus
            }
          : null,
      focusAge,
      history:
        history.map(
          item => ({
            ...item,
            focus:
              item.focus
                ? {
                    ...item.focus
                  }
                : null
          })
        )
    }
  }


  return {
    reset,
    observe,
    getState
  }
}


function dedupeReferents(
  referents
) {

  const seen =
    new Set()


  return (
    Array.isArray(
      referents
    )
      ? referents
      : []
  )
    .filter(
      item => {

        const identity =
          [
            item?.key,
            item?.number,
            item?.gender
          ]
            .join(
              ':'
            )


        if (
          seen.has(
            identity
          )
        ) {
          return false
        }


        seen.add(
          identity
        )

        return true
      }
    )
}


function collapseTitleReferents(
  referents
) {

  const values =
    Array.isArray(
      referents
    )
      ? referents
      : []

  const hasJesus =
    values.some(
      item =>
        item?.key ===
        'jesus'
    )

  const hasGod =
    values.some(
      item =>
        item?.key ===
        'god'
    )


  if (
    hasJesus &&
    !hasGod
  ) {
    return values.filter(
      item =>
        item?.key !==
        'lord'
    )
  }


  return values
}
