const {
  onCall,
  HttpsError
} = require(
  'firebase-functions/v2/https'
)

const {
  defineSecret
} = require(
  'firebase-functions/params'
)

const {
  getFirestore
} = require(
  'firebase-admin/firestore'
)


const apiBibleKey =
  defineSecret(
    'API_BIBLE_KEY'
  )


const BIBLE_IDS = {
  english:
    '78a9f6124f344018-01',

  danish:
    '20c3695eb7339cca-01',

  urdu:
    'eecbca904435fce9-01'
}


const API_BASE =
  'https://api.scripture.api.bible/v1'


exports.scriptureBibleLookup =
  onCall(
    {
      region:
        'europe-west1',

      secrets: [
        apiBibleKey
      ]
    },

    async request => {

      const uid =
        request.auth?.uid


      if (!uid) {

        throw new HttpsError(
          'unauthenticated',
          'Please sign in first.'
        )
      }


      await requireScripturePreparationAccess(
        uid
      )


      const apiKey =
        apiBibleKey.value()


      if (!apiKey) {

        throw new HttpsError(
          'failed-precondition',
          'API_BIBLE_KEY is not configured.'
        )
      }


      const mode =
        String(
          request.data?.mode ||
          ''
        )
          .trim()
          .toLowerCase()


      if (mode === 'books') {

        const language =
          normalizeLanguage(
            request.data?.language
          )


        return {
          language,
          books:
            await getBooks({
              apiKey,
              bibleId:
                BIBLE_IDS[language]
            })
        }
      }


      if (mode === 'chapters') {

        const language =
          normalizeLanguage(
            request.data?.language
          )

        const bookId =
          requireId(
            request.data?.bookId,
            'Book'
          )


        return {
          language,
          bookId,
          chapters:
            await getChapters({
              apiKey,
              bibleId:
                BIBLE_IDS[language],
              bookId
            })
        }
      }


      if (mode === 'verses') {

        const language =
          normalizeLanguage(
            request.data?.language
          )

        const chapterId =
          requireId(
            request.data?.chapterId,
            'Chapter'
          )


        return {
          language,
          chapterId,
          verses:
            await getVerses({
              apiKey,
              bibleId:
                BIBLE_IDS[language],
              chapterId
            })
        }
      }


      if (mode === 'passage') {

        const passageId =
          normalizePassageId(
            request.data?.passageId
          )


        if (!passageId) {

          throw new HttpsError(
            'invalid-argument',
            'Passage ID is required.'
          )
        }


        const [
          english,
          danish,
          urdu
        ] =
          await Promise.all([
            getPassage({
              apiKey,
              bibleId:
                BIBLE_IDS.english,
              passageId
            }),

            getPassage({
              apiKey,
              bibleId:
                BIBLE_IDS.danish,
              passageId
            }),

            getPassage({
              apiKey,
              bibleId:
                BIBLE_IDS.urdu,
              passageId
            })
          ])


        return {
          passageId,
          translations: {
            english,
            danish,
            urdu
          }
        }
      }


      throw new HttpsError(
        'invalid-argument',
        'Unknown Bible lookup mode.'
      )
    }
  )


async function requireScripturePreparationAccess(
  uid
) {

  const db =
    getFirestore()


  const [
    memberDocument,
    adminDocument
  ] =
    await Promise.all([
      db
        .collection(
          'members'
        )
        .doc(
          uid
        )
        .get(),

      db
        .collection(
          'adminAccess'
        )
        .doc(
          uid
        )
        .get()
    ])


  const member =
    memberDocument.data() ||
    {}

  const admin =
    adminDocument.data() ||
    {}


  const allowed =
    member.scripturePreparation === true ||
    member.scripturePreparationMember === true ||
    member.scripturePreparationAdmin === true ||
    admin.scripturePreparation === true ||
    admin.scripturePreparationAdmin === true ||
    admin.planAdmin === true ||
    admin.churchAdmin === true


  if (!allowed) {

    throw new HttpsError(
      'permission-denied',
      'Scripture Preparation permission is required.'
    )
  }
}


function normalizeLanguage(
  value
) {

  const language =
    String(
      value ||
      ''
    )
      .trim()
      .toLowerCase()


  if (
    !Object.prototype
      .hasOwnProperty.call(
        BIBLE_IDS,
        language
      )
  ) {

    throw new HttpsError(
      'invalid-argument',
      'Language must be English, Danish, or Urdu.'
    )
  }


  return language
}


function requireId(
  value,
  label
) {

  const id =
    String(
      value ||
      ''
    ).trim()


  if (!id) {

    throw new HttpsError(
      'invalid-argument',
      `${label} is required.`
    )
  }


  return id
}


async function getBooks({
  apiKey,
  bibleId
}) {

  const data =
    await apiBibleRequest({
      apiKey,
      path:
        `/bibles/${encodeURIComponent(
          bibleId
        )}/books`
    })


  return (
    Array.isArray(data)
      ? data
      : []
  )
    .map(
      book => ({
        id:
          String(
            book?.id ||
            ''
          ),

        name:
          String(
            book?.name ||
            book?.nameLong ||
            book?.id ||
            ''
          ),

        nameLong:
          String(
            book?.nameLong ||
            book?.name ||
            ''
          )
      })
    )
    .filter(
      book =>
        book.id
    )
}


async function getChapters({
  apiKey,
  bibleId,
  bookId
}) {

  const data =
    await apiBibleRequest({
      apiKey,
      path:
        `/bibles/${encodeURIComponent(
          bibleId
        )}/books/${encodeURIComponent(
          bookId
        )}/chapters`
    })


  return (
    Array.isArray(data)
      ? data
      : []
  )
    .filter(
      chapter =>
        /^\d+$/
          .test(
            String(
              chapter?.number ||
              ''
            )
          )
    )
    .map(
      chapter => ({
        id:
          String(
            chapter?.id ||
            ''
          ),

        number:
          String(
            chapter?.number ||
            ''
          )
      })
    )
}


async function getVerses({
  apiKey,
  bibleId,
  chapterId
}) {

  const data =
    await apiBibleRequest({
      apiKey,
      path:
        `/bibles/${encodeURIComponent(
          bibleId
        )}/chapters/${encodeURIComponent(
          chapterId
        )}/verses`
    })


  return (
    Array.isArray(data)
      ? data
      : []
  )
    .map(
      verse => ({
        id:
          String(
            verse?.id ||
            ''
          ),

        number:
          String(
            verse?.reference ||
            verse?.id ||
            ''
          )
            .split('.')
            .pop()
      })
    )
    .filter(
      verse =>
        verse.id
    )
}


async function getPassage({
  apiKey,
  bibleId,
  passageId
}) {

  const bookId =
    getBookIdFromPassageId(
      passageId
    )


  const [
    data,
    book
  ] =
    await Promise.all([
      apiBibleRequest({
        apiKey,
        path:
          `/bibles/${encodeURIComponent(
            bibleId
          )}/passages/${encodeURIComponent(
            passageId
          )}`
      }),

      bookId
        ? apiBibleRequest({
            apiKey,
            path:
              `/bibles/${encodeURIComponent(
                bibleId
              )}/books/${encodeURIComponent(
                bookId
              )}`
          })
        : Promise.resolve(null)
    ])


  const localizedReference =
    buildLocalizedReference(
      String(
        book?.name ||
        book?.nameLong ||
        ''
      ).trim(),
      passageId
    )


  return {
    reference:
      localizedReference ||
      String(
        data?.reference ||
        ''
      ).trim(),

    text:
      cleanBiblePassageText(
        data?.content
      )
  }
}


function getBookIdFromPassageId(
  passageId
) {

  return String(
    passageId ||
    ''
  )
    .split('-')[0]
    .split('.')[0]
    .trim()
}


function buildLocalizedReference(
  bookName,
  passageId
) {

  const start =
    String(
      passageId ||
      ''
    )
      .split('-')[0]
      .split('.')


  const end =
    String(
      passageId ||
      ''
    )
      .split('-')
      .pop()
      .split('.')


  if (
    !bookName ||
    start.length < 3
  ) {
    return ''
  }


  const chapter =
    start[1]

  const startVerse =
    start[2]

  const endChapter =
    end.length >= 3
      ? end[1]
      : chapter

  const endVerse =
    end.length >= 3
      ? end[2]
      : startVerse


  if (
    chapter === endChapter &&
    startVerse === endVerse
  ) {
    return `${bookName} ${chapter}:${startVerse}`
  }


  if (
    chapter === endChapter
  ) {
    return `${bookName} ${chapter}:${startVerse}–${endVerse}`
  }


  return `${bookName} ${chapter}:${startVerse}–${endChapter}:${endVerse}`
}


async function apiBibleRequest({
  apiKey,
  path
}) {

  const response =
    await fetch(
      `${API_BASE}${path}`,
      {
        method:
          'GET',

        headers: {
          'api-key':
            apiKey
        }
      }
    )


  let result


  try {
    result =
      await response.json()
  } catch {
    result =
      null
  }


  if (!response.ok) {

    console.error(
      'API.Bible lookup failed:',
      result
    )


    throw new HttpsError(
      'internal',
      result?.message ||
      result?.error ||
      'Unable to load Bible information.'
    )
  }


  return result?.data
}


function normalizePassageId(
  passageId
) {

  return String(
    passageId ||
    ''
  )
    .trim()
    .toUpperCase()
    .replace(
      /:/g,
      '.'
    )
    .replace(
      /\s+/g,
      ''
    )
}


function cleanBiblePassageText(
  content
) {

  return String(
    content ||
    ''
  )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      ''
    )
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      ''
    )
    .replace(
      /<sup[^>]*>[\s\S]*?<\/sup>/gi,
      ''
    )
    .replace(
      /<[^>]+>/g,
      ' '
    )
    .replace(
      /&nbsp;/g,
      ' '
    )
    .replace(
      /&amp;/g,
      '&'
    )
    .replace(
      /&quot;/g,
      '"'
    )
    .replace(
      /&#39;/g,
      "'"
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
}
