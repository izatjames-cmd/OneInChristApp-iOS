/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingAdminForm.js
 *
 * Purpose:
 * Builds and reads the AI Bible Reading admin edit form.
 * ============================================================
 */

export function createLanguageEditFields({
  language,
  title
}) {

  const urduStyle =
    language === 'urdu'
      ? "direction:rtl; text-align:right; font-family:'Jameel Noori Nastaliq', serif; font-size:18px; line-height:2;"
      : ''


  return `
    <fieldset style="border:1px solid #ddd; padding:12px; margin:12px 0;">
      <legend>${title}</legend>

      <label>
        Bible Reference
        <input
          type="text"
          name="${language}VerseReference"
          required
          style="${urduStyle}"
        />
      </label>

      <label>
        Bible Text
        <textarea
          name="${language}VerseText"
          rows="4"
          required
          style="${urduStyle}"
        ></textarea>
      </label>

      <label>
        Reflection
        <textarea
          name="${language}Reflection"
          rows="4"
          required
          style="${urduStyle}"
        ></textarea>
      </label>

      <label>
        Thinking Questions
        <textarea
          name="${language}Questions"
          rows="5"
          required
          style="${urduStyle}"
        ></textarea>
      </label>
    </fieldset>
  `
}


export function fillLanguageFields({
  form,
  language,
  content = {}
}) {

  form.elements[`${language}VerseReference`].value =
    content?.verseReference || ''
  form.elements[`${language}VerseText`].value =
    content?.verseText || ''
  form.elements[`${language}Reflection`].value =
    content?.reflection || ''
  form.elements[`${language}Questions`].value =
    (content?.questions || []).join('\n')
}


export function createReadingDataFromForm(
  form
) {

  return {
    date:
      form.elements.date.value,

    verseReference:
      form.elements.englishVerseReference.value,

    verseText:
      form.elements.englishVerseText.value,

    reflection:
      form.elements.englishReflection.value,

    questions:
      parseQuestions(
        form.elements.englishQuestions.value
      ),

    translations: {
      danish:
        createLanguageDataFromForm(
          form,
          'danish'
        ),

      urdu:
        createLanguageDataFromForm(
          form,
          'urdu'
        )
    }
  }
}


function createLanguageDataFromForm(
  form,
  language
) {

  return {
    verseReference:
      form.elements[`${language}VerseReference`].value,

    verseText:
      form.elements[`${language}VerseText`].value,

    reflection:
      form.elements[`${language}Reflection`].value,

    questions:
      parseQuestions(
        form.elements[`${language}Questions`].value
      )
  }
}


function parseQuestions(
  value
) {

  return String(
    value || ''
  )
    .split(/\r?\n/)
    .map(
      question =>
        question
          .replace(/^\s*[-0-9.)]+\s*/, '')
          .trim()
    )
    .filter(Boolean)
}
