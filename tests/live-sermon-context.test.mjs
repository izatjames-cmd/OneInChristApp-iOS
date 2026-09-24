import assert from 'node:assert/strict'

import {
  createSermonContext
} from '../src/live-sermon/context/sermonContext.js'

import {
  applyContextualGrammar
} from '../src/live-sermon/context/contextualTranslation.js'


function translate(
  context,
  sourceText,
  rawEnglish,
  rawDanish
) {

  const snapshot =
    context.observe(
      sourceText,
      'urdu'
    )

  return {
    english:
      applyContextualGrammar(
        rawEnglish,
        'english',
        snapshot
      ),
    danish:
      applyContextualGrammar(
        rawDanish,
        'danish',
        snapshot
      ),
    snapshot
  }
}


{
  const context =
    createSermonContext()

  translate(
    context,
    'یسوع مسیح ہمارے خداوند ہیں۔',
    'Jesus Christ is our Lord.',
    'Jesus Kristus er vores Herre.'
  )

  const second =
    translate(
      context,
      'وہ ہم سے محبت کرتے ہیں۔',
      'They love us.',
      'De elsker os.'
    )

  assert.equal(
    second.english,
    'He loves us.'
  )

  assert.equal(
    second.danish,
    'Han elsker os.'
  )

  const third =
    translate(
      context,
      'ہم اُس پر ایمان رکھتے ہیں۔',
      'We believe in them.',
      'Vi tror på dem.'
    )

  assert.equal(
    third.english,
    'We believe in Him.'
  )

  assert.equal(
    third.danish,
    'Vi tror på ham.'
  )
}


{
  const context =
    createSermonContext()

  translate(
    context,
    'مریم وہاں تھی۔',
    'Mary was there.',
    'Maria var der.'
  )

  const next =
    translate(
      context,
      'وہ گھر گئی۔',
      'They went home.',
      'De gik hjem.'
    )

  assert.equal(
    next.english,
    'She went home.'
  )

  assert.equal(
    next.danish,
    'Hun gik hjem.'
  )
}


{
  const context =
    createSermonContext()

  translate(
    context,
    'شاگردوں نے دعا کی۔',
    'The disciples prayed.',
    'Disciplene bad.'
  )

  const next =
    translate(
      context,
      'وہ شہر گئے۔',
      'He went to the city.',
      'Han gik til byen.'
    )

  assert.equal(
    next.english,
    'They went to the city.'
  )

  assert.equal(
    next.danish,
    'De gik til byen.'
  )
}


{
  const context =
    createSermonContext()

  translate(
    context,
    'یسوع نے شاگردوں سے بات کی۔',
    'Jesus spoke to the disciples.',
    'Jesus talte til disciplene.'
  )

  const next =
    translate(
      context,
      'وہ وہاں گئے۔',
      'They went there.',
      'De gik derhen.'
    )

  // Multiple possible antecedents were present, so the module must
  // not guess and rewrite the translation.
  assert.equal(
    next.english,
    'They went there.'
  )

  assert.equal(
    next.danish,
    'De gik derhen.'
  )
}


console.log(
  'Live sermon context tests passed.'
)

{
  const context =
    createSermonContext()

  translate(
    context,
    'یسوع مسیح ہمارے خداوند ہیں۔',
    'Jesus Christ is our Lord.',
    'Jesus Kristus er vores Herre.'
  )

  const next =
    translate(
      context,
      'وہ انہیں نجات دیتا ہے۔',
      'They give them salvation.',
      'De giver dem frelse.'
    )

  // The remembered subject is Jesus, but "them/dem" is a different
  // object in the same sentence and must stay plural.
  assert.equal(
    next.english,
    'He gives them salvation.'
  )

  assert.equal(
    next.danish,
    'Han giver dem frelse.'
  )
}

{
  const context =
    createSermonContext()

  translate(
    context,
    'یسوع مسیح ہمارے خداوند ہیں۔',
    'Jesus Christ is our Lord.',
    'Jesus Kristus er vores Herre.'
  )

  const next =
    translate(
      context,
      'انہوں نے ہمیں بلایا۔',
      'They have called us.',
      'De har kaldt os.'
    )

  assert.equal(
    next.english,
    'He has called us.'
  )

  assert.equal(
    next.danish,
    'Han har kaldt os.'
  )
}
