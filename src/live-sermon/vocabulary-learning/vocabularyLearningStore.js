import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

const SUGGESTIONS_COLLECTION =
  'sermonVocabularySuggestions'

const LEARNED_COLLECTION =
  'learnedChurchVocabulary'


export async function ensureVocabularySuggestions({
  planId,
  sessionId,
  sourceLanguage,
  candidates,
  uid
}) {

  if (
    !sessionId ||
    !sourceLanguage
  ) {
    return []
  }


  const existing =
    await getVocabularySuggestions(
      sessionId
    )

  const existingIds =
    new Set(
      existing.map(
        item =>
          item.id
      )
    )

  const now =
    new Date()
      .toISOString()


  for (
    const candidate of (
      candidates || []
    )
  ) {

    const id =
      createSuggestionId(
        sessionId,
        candidate?.normalizedTerm ||
        candidate?.sourceTerm
      )


    if (
      !id ||
      existingIds.has(id)
    ) {
      continue
    }


    await FirebaseFirestore.setDocument({
      reference:
        `${SUGGESTIONS_COLLECTION}/${id}`,

      data: {
        planId:
          planId || '',
        sessionId,
        sourceLanguage,
        sourceTerm:
          String(
            candidate?.sourceTerm || ''
          ).trim(),
        normalizedTerm:
          String(
            candidate?.normalizedTerm || ''
          ).trim(),
        frequency:
          Number(
            candidate?.frequency || 1
          ),
        context:
          String(
            candidate?.context || ''
          ).trim(),
        status:
          'pending',
        createdBy:
          uid || '',
        createdAt:
          now,
        updatedAt:
          now
      },

      merge:
        false
    })
  }


  return getVocabularySuggestions(
    sessionId
  )
}


export async function getVocabularySuggestions(
  sessionId
) {

  if (!sessionId) {
    return []
  }


  const result =
    await FirebaseFirestore.getCollection({
      reference:
        SUGGESTIONS_COLLECTION,

      compositeFilter: {
        type:
          'and',
        queryConstraints: [
          {
            type:
              'where',
            fieldPath:
              'sessionId',
            opStr:
              '==',
            value:
              sessionId
          }
        ]
      }
    })


  return (
    result?.snapshots || []
  )
    .map(
      snapshot => ({
        id:
          snapshot.id,
        ...snapshot.data
      })
    )
    .sort(
      (
        first,
        second
      ) =>
        Number(
          second?.frequency || 0
        ) -
        Number(
          first?.frequency || 0
        )
    )
}


export async function approveVocabularySuggestion({
  suggestion,
  preferred,
  aliases = {},
  uid
}) {

  if (!suggestion?.id) {
    throw new Error(
      'Vocabulary suggestion is missing.'
    )
  }


  const sourceLanguage =
    String(
      suggestion.sourceLanguage || ''
    ).trim()

  const sourceTerm =
    String(
      suggestion.sourceTerm || ''
    ).trim()


  if (
    !sourceLanguage ||
    !sourceTerm
  ) {
    throw new Error(
      'Source vocabulary is missing.'
    )
  }


  const normalizedPreferred = {
    danish:
      String(
        preferred?.danish || ''
      ).trim(),
    english:
      String(
        preferred?.english || ''
      ).trim(),
    urdu:
      String(
        preferred?.urdu || ''
      ).trim()
  }


  if (
    !normalizedPreferred[
      sourceLanguage
    ]
  ) {
    normalizedPreferred[
      sourceLanguage
    ] = sourceTerm
  }


  const normalizedAliases = {
    danish:
      normalizeAliases(
        aliases?.danish
      ),
    english:
      normalizeAliases(
        aliases?.english
      ),
    urdu:
      normalizeAliases(
        aliases?.urdu
      )
  }


  if (
    !normalizedAliases[
      sourceLanguage
    ].includes(
      sourceTerm
    )
  ) {
    normalizedAliases[
      sourceLanguage
    ].push(
      sourceTerm
    )
  }


  const entryId =
    createLearnedEntryId(
      sourceLanguage,
      sourceTerm
    )

  const now =
    new Date()
      .toISOString()


  await FirebaseFirestore.setDocument({
    reference:
      `${LEARNED_COLLECTION}/${entryId}`,

    data: {
      sourceLanguage,
      sourceTerm,
      preferred:
        normalizedPreferred,
      aliases:
        normalizedAliases,
      active:
        true,
      status:
        'approved',
      sourcePlanId:
        suggestion.planId || '',
      sourceSessionId:
        suggestion.sessionId || '',
      createdBy:
        uid || '',
      createdAt:
        now,
      updatedAt:
        now
    },

    merge:
      true
  })


  await FirebaseFirestore.updateDocument({
    reference:
      `${SUGGESTIONS_COLLECTION}/${suggestion.id}`,

    data: {
      status:
        'approved',
      learnedEntryId:
        entryId,
      reviewedBy:
        uid || '',
      reviewedAt:
        now,
      updatedAt:
        now
    }
  })


  return entryId
}


export async function rejectVocabularySuggestion({
  suggestionId,
  uid
}) {

  if (!suggestionId) {
    return
  }


  const now =
    new Date()
      .toISOString()


  await FirebaseFirestore.updateDocument({
    reference:
      `${SUGGESTIONS_COLLECTION}/${suggestionId}`,

    data: {
      status:
        'rejected',
      reviewedBy:
        uid || '',
      reviewedAt:
        now,
      updatedAt:
        now
    }
  })
}


function normalizeAliases(
  values
) {

  const list =
    Array.isArray(values)
      ? values
      : String(
          values || ''
        )
          .split(',')


  return [
    ...new Set(
      list
        .map(
          value =>
            String(
              value || ''
            ).trim()
        )
        .filter(Boolean)
    )
  ]
}


function createSuggestionId(
  sessionId,
  term
) {

  const safeSession =
    String(
      sessionId || ''
    )
      .replace(
        /[^a-zA-Z0-9_-]/g,
        '_'
      )

  const normalizedTerm =
    String(
      term || ''
    ).trim()


  if (
    !safeSession ||
    !normalizedTerm
  ) {
    return ''
  }


  return `${safeSession}_${hashText(normalizedTerm)}`
}


function createLearnedEntryId(
  language,
  term
) {

  return `LEARNED_${String(language).toUpperCase()}_${hashText(term)}`
}


function hashText(
  value
) {

  let hash =
    2166136261


  for (
    const character of String(value)
  ) {
    hash ^= character.codePointAt(0)
    hash = Math.imul(
      hash,
      16777619
    )
  }


  return (
    hash >>> 0
  )
    .toString(36)
    .toUpperCase()
}
