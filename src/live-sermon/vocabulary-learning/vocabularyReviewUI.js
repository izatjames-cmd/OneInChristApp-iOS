import {
  getCurrentMember
} from '../../auth/phoneAuth.js'

import {
  refreshLearnedChurchVocabulary
} from '../../shared/church-vocabulary/churchVocabulary.js'

import {
  extractVocabularyCandidates
} from './candidateExtractor.js'

import {
  approveVocabularySuggestion,
  ensureVocabularySuggestions,
  rejectVocabularySuggestion
} from './vocabularyLearningStore.js'


export async function openVocabularyReview({
  planId,
  sessionId,
  sourceLanguage,
  segments
}) {

  const user =
    await getCurrentMember()

  if (!user?.uid) {
    alert('Please sign in again.')
    return
  }


  const overlay =
    ensureReviewOverlay()

  overlay.style.display =
    'block'

  const list =
    overlay.querySelector(
      '#vocabulary-review-list'
    )

  list.innerHTML =
    '<p>Analyzing sermon vocabulary...</p>'


  try {
    await refreshLearnedChurchVocabulary()
  } catch (error) {
    console.warn(
      'Unable to refresh learned vocabulary before analysis:',
      error
    )
  }


  const candidates =
    extractVocabularyCandidates({
      segments,
      sourceLanguage,
      limit:
        30
    })


  const suggestions =
    await ensureVocabularySuggestions({
      planId,
      sessionId,
      sourceLanguage,
      candidates,
      uid:
        user.uid
    })


  renderSuggestions({
    list,
    suggestions:
      suggestions.filter(
        item =>
          item.status === 'pending'
      ),
    sourceLanguage,
    uid:
      user.uid
  })
}


function ensureReviewOverlay() {

  let overlay =
    document.querySelector(
      '#sermon-vocabulary-review-overlay'
    )


  if (overlay) {
    return overlay
  }


  overlay =
    document.createElement('div')

  overlay.id =
    'sermon-vocabulary-review-overlay'

  overlay.style.position =
    'fixed'
  overlay.style.inset =
    '0'
  overlay.style.zIndex =
    '71000'
  overlay.style.background =
    '#fffdf8'
  overlay.style.overflow =
    'auto'
  overlay.style.display =
    'none'

  overlay.innerHTML = `
    <div style="max-width:760px;margin:0 auto;padding:16px;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;">
        <div>
          <h2 style="margin:0;">Church Vocabulary Review</h2>
          <p style="margin:6px 0 0;color:#666;">Nothing is added automatically. Approve only useful church or biblical terminology.</p>
        </div>
        <button id="close-vocabulary-review" type="button">Close</button>
      </div>
      <div id="vocabulary-review-list" style="margin-top:16px;"></div>
    </div>
  `

  document.body.appendChild(
    overlay
  )

  overlay
    .querySelector(
      '#close-vocabulary-review'
    )
    ?.addEventListener(
      'click',
      () => {
        overlay.style.display =
          'none'
      }
    )

  return overlay
}


function renderSuggestions({
  list,
  suggestions,
  sourceLanguage,
  uid
}) {

  list.innerHTML =
    ''


  if (!suggestions.length) {
    list.innerHTML =
      '<p>No new repeated vocabulary suggestions were found for this sermon.</p>'
    return
  }


  suggestions.forEach(
    suggestion => {

      const card =
        document.createElement('div')

      card.style.border =
        '1px solid #ddd8cf'
      card.style.borderRadius =
        '10px'
      card.style.padding =
        '12px'
      card.style.marginBottom =
        '12px'
      card.style.background =
        '#ffffff'

      const heading =
        document.createElement('div')

      heading.style.fontWeight =
        '700'
      heading.textContent =
        `${suggestion.sourceTerm} — heard ${suggestion.frequency} times`

      card.appendChild(
        heading
      )

      if (suggestion.context) {
        const context =
          document.createElement('div')
        context.style.fontSize =
          '13px'
        context.style.color =
          '#666'
        context.style.margin =
          '6px 0 10px'
        context.textContent =
          suggestion.context
        card.appendChild(
          context
        )
      }

      const inputs = {}

      ;[
        ['danish', 'Danish'],
        ['english', 'English'],
        ['urdu', 'Urdu']
      ].forEach(
        ([key, label]) => {

          const wrapper =
            document.createElement('label')
          wrapper.style.display =
            'block'
          wrapper.style.margin =
            '8px 0'
          wrapper.textContent =
            label

          const input =
            document.createElement('input')
          input.type =
            'text'
          input.style.width =
            '100%'
          input.style.boxSizing =
            'border-box'
          input.style.padding =
            '9px'
          input.value =
            key === sourceLanguage
              ? suggestion.sourceTerm
              : ''

          if (key === 'urdu') {
            input.dir =
              'rtl'
            input.classList.add(
              'urdu-text'
            )
          }

          inputs[key] =
            input
          wrapper.appendChild(
            input
          )
          card.appendChild(
            wrapper
          )
        }
      )

      const aliasLabel =
        document.createElement('label')
      aliasLabel.style.display =
        'block'
      aliasLabel.style.margin =
        '8px 0'
      aliasLabel.textContent =
        'Optional alternate forms (comma separated)'

      const aliasInput =
        document.createElement('input')
      aliasInput.type =
        'text'
      aliasInput.style.width =
        '100%'
      aliasInput.style.boxSizing =
        'border-box'
      aliasInput.style.padding =
        '9px'

      aliasLabel.appendChild(
        aliasInput
      )
      card.appendChild(
        aliasLabel
      )

      const row =
        document.createElement('div')
      row.style.display =
        'flex'
      row.style.gap =
        '8px'
      row.style.marginTop =
        '10px'

      const approve =
        document.createElement('button')
      approve.type =
        'button'
      approve.textContent =
        'Approve'
      approve.style.flex =
        '1'

      const reject =
        document.createElement('button')
      reject.type =
        'button'
      reject.textContent =
        'Reject'
      reject.style.flex =
        '1'

      approve.addEventListener(
        'click',
        async () => {
          approve.disabled =
            true
          reject.disabled =
            true

          try {
            await approveVocabularySuggestion({
              suggestion,
              preferred: {
                danish:
                  inputs.danish.value,
                english:
                  inputs.english.value,
                urdu:
                  inputs.urdu.value
              },
              aliases: {
                [sourceLanguage]:
                  aliasInput.value
              },
              uid
            })

            await refreshLearnedChurchVocabulary()
            card.remove()
          } catch (error) {
            console.error(
              'Unable to approve vocabulary:',
              error
            )
            alert(
              `Unable to approve vocabulary: ${error?.message || error}`
            )
            approve.disabled =
              false
            reject.disabled =
              false
          }
        }
      )

      reject.addEventListener(
        'click',
        async () => {
          approve.disabled =
            true
          reject.disabled =
            true

          try {
            await rejectVocabularySuggestion({
              suggestionId:
                suggestion.id,
              uid
            })
            card.remove()
          } catch (error) {
            console.error(
              'Unable to reject vocabulary:',
              error
            )
            alert(
              `Unable to reject vocabulary: ${error?.message || error}`
            )
            approve.disabled =
              false
            reject.disabled =
              false
          }
        }
      )

      row.appendChild(
        approve
      )
      row.appendChild(
        reject
      )
      card.appendChild(
        row
      )
      list.appendChild(
        card
      )
    }
  )
}
