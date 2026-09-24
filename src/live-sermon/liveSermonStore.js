import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'


const COLLECTION =
  'liveSermonSessions'


function sessionReference(
  planId
) {

  return `${COLLECTION}/${planId}`
}


function segmentsReference(
  planId
) {

  return `${sessionReference(planId)}/segments`
}


export async function getLiveSermonSession(
  planId
) {

  if (!planId) {
    return null
  }


  const result =
    await FirebaseFirestore.getDocument({
      reference:
        sessionReference(
          planId
        )
    })


  if (
    !result?.snapshot ||
    !result.snapshot.data
  ) {
    return null
  }


  return {
    id:
      result.snapshot.id,

    ...result.snapshot.data
  }
}


export async function startLiveSermonSession({
  planId,
  sessionId,
  sourceLanguage,
  targetLanguages,
  uid
}) {

  const now =
    new Date()
      .toISOString()


  await FirebaseFirestore.setDocument({
    reference:
      sessionReference(
        planId
      ),

    data: {
      planId,
      sessionId,
      active:
        true,
      sourceLanguage,
      targetLanguages:
        Array.isArray(
          targetLanguages
        )
          ? targetLanguages
          : [],
      startedBy:
        uid || '',
      startedAt:
        now,
      heartbeatAt:
        now,
      endedAt:
        '',
      updatedAt:
        now
    },

    merge:
      false
  })
}


export async function touchLiveSermonSession(
  planId,
  sessionId
) {

  if (
    !planId ||
    !sessionId
  ) {
    return
  }


  const session =
    await getLiveSermonSession(
      planId
    )


  if (
    session?.sessionId !==
      sessionId ||
    session?.active !== true
  ) {
    return
  }


  const now =
    new Date()
      .toISOString()


  await FirebaseFirestore.updateDocument({
    reference:
      sessionReference(
        planId
      ),

    data: {
      heartbeatAt:
        now,
      updatedAt:
        now
    }
  })
}


export async function stopLiveSermonSession({
  planId,
  sessionId = ''
}) {

  if (!planId) {
    return
  }


  const current =
    await getLiveSermonSession(
      planId
    )


  if (!current) {
    return
  }


  if (
    sessionId &&
    current.sessionId &&
    current.sessionId !==
      sessionId
  ) {
    return
  }


  const now =
    new Date()
      .toISOString()


  await FirebaseFirestore.updateDocument({
    reference:
      sessionReference(
        planId
      ),

    data: {
      active:
        false,
      endedAt:
        now,
      heartbeatAt:
        now,
      updatedAt:
        now
    }
  })
}


export async function addLiveSermonSegment({
  planId,
  sessionId,
  sequence,
  sourceLanguage,
  sourceText,
  translations
}) {

  if (
    !planId ||
    !sessionId ||
    !sourceText
  ) {
    return
  }


  const safeSequence =
    Number(
      sequence ||
      Date.now()
    )


  const segmentId =
    `${sessionId}_${safeSequence}`
      .replace(
        /[^a-zA-Z0-9_-]/g,
        '_'
      )


  await FirebaseFirestore.setDocument({
    reference:
      `${segmentsReference(planId)}/${segmentId}`,

    data: {
      planId,
      sessionId,
      sequence:
        safeSequence,
      sourceLanguage,
      sourceText:
        String(
          sourceText ||
          ''
        ).trim(),
      translations:
        translations || {},
      createdAt:
        new Date()
          .toISOString()
    },

    merge:
      false
  })
}


export async function deleteLiveSermonChat(
  planId
) {

  if (!planId) {
    throw new Error(
      'Service Plan is missing.'
    )
  }


  const current =
    await getLiveSermonSession(
      planId
    )


  if (
    current?.active ===
    true
  ) {

    throw new Error(
      'Stop Live Translation before deleting the chat.'
    )
  }


  const result =
    await FirebaseFirestore.getCollection({
      reference:
        segmentsReference(
          planId
        )
    })


  const snapshots =
    result?.snapshots ||
    []


  for (
    let index = 0;
    index < snapshots.length;
    index += 20
  ) {

    const batch =
      snapshots.slice(
        index,
        index + 20
      )


    const results =
      await Promise.allSettled(
        batch.map(
          snapshot =>
            FirebaseFirestore.deleteDocument({
              reference:
                `${segmentsReference(planId)}/${snapshot.id}`
            })
        )
      )


    const failure =
      results.find(
        item =>
          item.status ===
          'rejected'
      )


    if (failure) {
      throw (
        failure.reason ||
        new Error(
          'Unable to delete all Live Translation text.'
        )
      )
    }
  }


  if (current) {

    await FirebaseFirestore.deleteDocument({
      reference:
        sessionReference(
          planId
        )
    })
  }
}


export async function subscribeLiveSermonSession(
  planId,
  onSession,
  onError
) {

  let active =
    true


  const callbackId =
    await FirebaseFirestore.addDocumentSnapshotListener(
      {
        reference:
          sessionReference(
            planId
          )
      },

      (
        result,
        error
      ) => {

        if (!active) {
          return
        }


        if (error) {
          onError?.(
            error
          )
          return
        }


        const snapshot =
          result?.snapshot


        if (
          !snapshot ||
          !snapshot.data
        ) {
          onSession?.(
            null
          )
          return
        }


        onSession?.({
          id:
            snapshot.id,
          ...snapshot.data
        })
      }
    )


  return async () => {

    if (!active) {
      return
    }


    active =
      false


    await FirebaseFirestore.removeSnapshotListener({
      callbackId
    })
  }
}


export async function subscribeLiveSermonSegments(
  planId,
  sessionId,
  onSegments,
  onError
) {

  let active =
    true


  const callbackId =
    await FirebaseFirestore.addCollectionSnapshotListener(
      {
        reference:
          segmentsReference(
            planId
          ),

        queryConstraints: [
          {
            type:
              'orderBy',
            fieldPath:
              'sequence',
            directionStr:
              'desc'
          },
          {
            type:
              'limit',
            limit:
              250
          }
        ]
      },

      (
        result,
        error
      ) => {

        if (!active) {
          return
        }


        if (error) {
          onError?.(
            error
          )
          return
        }


        const segments =
          (
            result?.snapshots ||
            []
          )
            .map(
              snapshot => ({
                id:
                  snapshot.id,
                ...snapshot.data
              })
            )
            .filter(
              item =>
                item.sessionId ===
                sessionId
            )
            .sort(
              (
                a,
                b
              ) =>
                Number(
                  a.sequence ||
                  0
                ) -
                Number(
                  b.sequence ||
                  0
                )
            )


        onSegments?.(
          segments
        )
      }
    )


  return async () => {

    if (!active) {
      return
    }


    active =
      false


    await FirebaseFirestore.removeSnapshotListener({
      callbackId
    })
  }
}
