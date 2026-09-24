import {
  getLatestScripturePreparation
} from './scripturePreparationStore.js'


export async function renderScripturePreparationDashboard({
  container,
  onQuickEdit
}) {

  const latest =
    await getLatestScripturePreparation()


  container.innerHTML =
    `
      <section>
        <h3>
          Welcome
        </h3>

        <p>
          Prepare the Bible readings and sermon details for the coming Sunday.
        </p>
      </section>

      <section style="margin-top:16px;">
        <h3>
          Upcoming Sunday
        </h3>

        <p>
          ${formatDate(getUpcomingSunday())}
        </p>
      </section>

      <section style="margin-top:16px;">
        <h3>
          Latest Saved Preparation
        </h3>

        ${
          latest
            ? latestSummary(latest)
            : '<p>No Scripture preparation has been saved yet.</p>'
        }
      </section>

      <button
        id="scripture-preparation-quick-edit"
        type="button"
        style="
          width:100%;
          padding:12px;
          margin-top:16px;
          font-weight:bold;
        "
      >
        Quick Edit
      </button>
    `


  container
    .querySelector(
      '#scripture-preparation-quick-edit'
    )
    ?.addEventListener(
      'click',
      onQuickEdit
    )
}


function latestSummary(
  preparation
) {

  return `
    <p>
      <strong>
        ${escapeHtml(formatDate(preparation.serviceDate))}
      </strong>
    </p>

    <p>
      ${escapeHtml(
        formatReference(
          preparation.mainReading
        ) ||
        'No main reading entered.'
      )}
    </p>
  `
}


function getUpcomingSunday() {

  const date =
    new Date()

  const day =
    date.getDay()

  const daysUntilSunday =
    day === 0
      ? 0
      : 7 - day

  date.setDate(
    date.getDate() +
    daysUntilSunday
  )

  return date
    .toISOString()
    .slice(0, 10)
}


function formatDate(
  value
) {

  if (!value) {
    return ''
  }

  return new Date(
    `${value}T12:00:00`
  )
    .toLocaleDateString(
      undefined,
      {
        weekday:
          'long',
        year:
          'numeric',
        month:
          'long',
        day:
          'numeric'
      }
    )
}


function formatReference(
  reference = {}
) {

  if (
    reference.urduReference ||
    reference.danishReference
  ) {

    return (
      reference.urduReference ||
      reference.danishReference ||
      ''
    )
  }


  return [
    reference.book,
    reference.chapter,
    reference.verse
  ]
    .filter(Boolean)
    .join(' ')
}


function escapeHtml(
  value
) {

  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
