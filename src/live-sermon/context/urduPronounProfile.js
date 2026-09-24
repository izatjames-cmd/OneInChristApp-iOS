export function analyzeUrduPronouns(
  text
) {

  const value =
    String(
      text || ''
    ).normalize('NFC').replace(/[\u064B-\u065F\u0670]/gu, '')

  const subjectSingular =
    /(?:^|[\s،,.!?؟؛])(?:اُس|اس)\s+نے(?=$|[\s،,.!?؟؛])/u.test(
      value
    )

  const subjectAmbiguous =
    /(?:^|[\s،,.!?؟؛])وہ(?=$|[\s،,.!?؟؛])/u.test(
      value
    )

  const subjectHonorificOrPlural =
    /(?:^|[\s،,.!?؟؛])(?:انہوں|انھوں)\s+نے(?=$|[\s،,.!?؟؛])/u.test(
      value
    )

  const objectSingular =
    /(?:اُسے|اسے|اُس\s+(?:کو|سے|پر|میں|تک)|اس\s+(?:کو|سے|پر|میں|تک)|اُس\s+کے\s+ساتھ|اس\s+کے\s+ساتھ)/u.test(
      value
    )

  const objectPluralOrHonorific =
    /(?:انہیں|انھیں|ان\s+(?:کو|سے|پر|میں|تک)|ان\s+کے\s+ساتھ)/u.test(
      value
    )

  const possessiveSingular =
    /(?:اُس|اس)\s+(?:کا|کی|کے)/u.test(
      value
    )

  const possessivePluralOrHonorific =
    /ان\s+(?:کا|کی|کے)/u.test(
      value
    )

  const hasThirdPersonSubject =
    subjectSingular ||
    subjectAmbiguous ||
    subjectHonorificOrPlural

  const hasThirdPersonObject =
    objectSingular ||
    objectPluralOrHonorific

  const hasThirdPersonPossessive =
    possessiveSingular ||
    possessivePluralOrHonorific


  return {
    subject:
      hasThirdPersonSubject,
    subjectSingular,
    subjectAmbiguous,
    subjectHonorificOrPlural,
    object:
      hasThirdPersonObject,
    objectSingular,
    objectPluralOrHonorific,
    possessive:
      hasThirdPersonPossessive,
    possessiveSingular,
    possessivePluralOrHonorific,

    // If a third-person subject is present, the remembered sermon
    // subject is normally that subject. Other third-person objects in
    // the same sentence may refer to somebody else, so do not rewrite
    // them from the same context automatically.
    resolveSubjectOnly:
      hasThirdPersonSubject,

    hasAny:
      hasThirdPersonSubject ||
      hasThirdPersonObject ||
      hasThirdPersonPossessive
  }
}
