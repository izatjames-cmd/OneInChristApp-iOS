// Explicit pairs avoid treating adverbs, adjectives or unknown past tenses as
// present-tense verbs (for example, "He always" must not become "He alway").
const PRESENT_VERBS = new Map([
  ['love', 'loves'], ['want', 'wants'], ['give', 'gives'],
  ['call', 'calls'], ['save', 'saves'], ['forgive', 'forgives'],
  ['teach', 'teaches'], ['guide', 'guides'], ['lead', 'leads'],
  ['bless', 'blesses'], ['watch', 'watches'], ['wash', 'washes'],
  ['pray', 'prays'], ['carry', 'carries'], ['try', 'tries'],
  ['go', 'goes'], ['come', 'comes'], ['know', 'knows'],
  ['speak', 'speaks'], ['say', 'says'], ['help', 'helps'],
  ['heal', 'heals'], ['care', 'cares'], ['live', 'lives'],
  ['walk', 'walks'], ['follow', 'follows'], ['believe', 'believes'],
  ['trust', 'trusts'], ['serve', 'serves'], ['hope', 'hopes'],
  ['change', 'changes'], ['renew', 'renews'], ['restore', 'restores'],
  ['surrender', 'surrenders'], ['promise', 'promises']
])
const BASE_VERBS = new Map([...PRESENT_VERBS].map(([base, third]) => [third, base]))

const ENGLISH_MODAL_OR_FIXED_VERBS =
  new Set([
    'can',
    'could',
    'may',
    'might',
    'must',
    'shall',
    'should',
    'will',
    'would',
    'was',
    'went',
    'came',
    'said',
    'saw',
    'gave',
    'took',
    'made',
    'spoke',
    'taught',
    'told',
    'heard',
    'knew',
    'found',
    'sent',
    'brought',
    'thought',
    'wrote',
    'read',
    'ate',
    'drank',
    'stood',
    'sat',
    'rose',
    'died',
    'lived'
  ])


export function enforceEnglishSingularAgreement(
  text
) {

  let value =
    String(
      text || ''
    )


  value =
    value.replace(
      /\b(He|She|he|she)\s+are\b/g,
      (
        _match,
        subject
      ) =>
        `${subject} is`
    )

  value =
    value.replace(
      /\b(He|She|he|she)\s+were\b/g,
      (
        _match,
        subject
      ) =>
        `${subject} was`
    )

  value =
    value.replace(
      /\b(He|She|he|she)\s+have\b/g,
      (
        _match,
        subject
      ) =>
        `${subject} has`
    )

  value =
    value.replace(
      /\b(He|She|he|she)\s+do\b/g,
      (
        _match,
        subject
      ) =>
        `${subject} does`
    )

  value =
    value.replace(
      /\b(He|She|he|she)\s+don't\b/gi,
      (
        _match,
        subject
      ) =>
        `${subject} doesn't`
    )

  value =
    value.replace(
      /\b(He|She|he|she)\s+([A-Za-z]+)\b/g,
      (
        match,
        subject,
        verb
      ) => {

        const lower =
          verb.toLowerCase()


        if (
          lower === 'is' ||
          lower === 'has' ||
          lower === 'does' ||
          ENGLISH_MODAL_OR_FIXED_VERBS.has(
            lower
          ) ||
          /(?:ed|ing|en)$/.test(
            lower
          )
        ) {
          return match
        }


        return `${subject} ${
          PRESENT_VERBS.get(lower) || verb
        }`
      }
    )


  return value
}


export function enforceEnglishPluralAgreement(
  text
) {

  let value =
    String(
      text || ''
    )


  value =
    value.replace(
      /\b(They|they)\s+is\b/g,
      (
        _match,
        subject
      ) =>
        `${subject} are`
    )

  value =
    value.replace(
      /\b(They|they)\s+was\b/g,
      (
        _match,
        subject
      ) =>
        `${subject} were`
    )

  value =
    value.replace(
      /\b(They|they)\s+has\b/g,
      (
        _match,
        subject
      ) =>
        `${subject} have`
    )

  value =
    value.replace(
      /\b(They|they)\s+does\b/g,
      (
        _match,
        subject
      ) =>
        `${subject} do`
    )

  value =
    value.replace(
      /\b(They|they)\s+doesn't\b/gi,
      (
        _match,
        subject
      ) =>
        `${subject} don't`
    )

  value =
    value.replace(
      /\b(They|they)\s+([A-Za-z]+)\b/g,
      (
        match,
        subject,
        verb
      ) => {

        const lower =
          verb.toLowerCase()


        if (
          ENGLISH_MODAL_OR_FIXED_VERBS.has(
            lower
          ) ||
          /(?:ed|ing|en)$/.test(
            lower
          )
        ) {
          return match
        }


        return `${subject} ${
          BASE_VERBS.get(lower) || verb
        }`
      }
    )


  return value
}
