import {
  FirebaseFunctions
} from '@capacitor-firebase/functions'


async function callLookup(
  data
) {

  const result =
    await FirebaseFunctions.callByName({
      name:
        'scriptureBibleLookup',

      region:
        'europe-west1',

      data
    })


  return result?.data || {}
}


export async function getBibleBooks(
  language
) {

  const result =
    await callLookup({
      mode:
        'books',
      language
    })


  return result.books || []
}


export async function getBibleChapters({
  language,
  bookId
}) {

  const result =
    await callLookup({
      mode:
        'chapters',
      language,
      bookId
    })


  return result.chapters || []
}


export async function getBibleVerses({
  language,
  chapterId
}) {

  const result =
    await callLookup({
      mode:
        'verses',
      language,
      chapterId
    })


  return result.verses || []
}


export async function getBiblePassage(
  passageId
) {

  const result =
    await callLookup({
      mode:
        'passage',
      passageId
    })


  return {
    passageId:
      result.passageId ||
      passageId ||
      '',

    translations:
      result.translations ||
      {}
  }
}
