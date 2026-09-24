import {
  isUrduScriptLine,
  parseCombinedLyrics
} from './hymnLyricsParser.js'


export function buildDynamicGeetHtml(
  geet
) {

  const urduTitle =
    String(
      geet?.urduTitle || ''
    ).trim()

  const romanTitle =
    String(
      geet?.romanTitle || ''
    ).trim()


  return `<!DOCTYPE html>
<html lang="ur">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(
    romanTitle ||
    urduTitle ||
    'Geet'
  )}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #f6f2ed;
    --paper: #ffffff;
    --text: #1c1c1c;
    --muted: #595959;
    --rule: #e0d8d0;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: "Inter", "Segoe UI", Arial, sans-serif;
  }
  .page {
    max-width: 860px;
    margin: 0 auto;
    padding: 36px 18px 72px;
  }
  .song-header {
    text-align: center;
    margin-bottom: 28px;
  }
  .urdu-title {
    margin: 0;
    direction: rtl;
    text-align: center;
    font-family: "Noto Nastaliq Urdu", serif;
    font-weight: 400;
    font-size: clamp(1.2rem, 1.8vw, 1.75rem);
    line-height: 1.7;
    color: #111;
  }
  .roman-title {
    margin-top: 12px;
    font-size: clamp(1rem, 1.5vw, 1.4rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--muted);
  }
  .section {
    margin-top: 26px;
    padding-top: 14px;
    border-top: 1px solid var(--rule);
  }
  .section-label {
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 700;
    color: var(--muted);
    margin-bottom: 12px;
  }
  .urdu-block {
    direction: rtl;
    text-align: right;
    font-family: "Noto Nastaliq Urdu", serif;
    font-size: clamp(1.2rem, 1.8vw, 1.75rem);
    line-height: 2.2;
    color: #111;
    margin: 0;
  }
  .roman-block {
    direction: ltr;
    text-align: left;
    font-family: "Inter", Arial, sans-serif;
    font-size: clamp(1rem, 1.4vw, 1.25rem);
    line-height: 1.9;
    color: #222;
    margin-top: 12px;
  }
  @media (max-width: 560px) {
    .page {
      padding-left: 14px;
      padding-right: 14px;
    }
    .section {
      margin-top: 20px;
    }
    .urdu-block {
      font-size: clamp(1.05rem, 5.4vw, 1.5rem);
      line-height: 1.9;
    }
    .roman-block {
      font-size: 0.98rem;
    }
  }
</style>
</head>
<body>
${buildHymnMainMarkup(
    geet
  )}
</body>
</html>`
}


export function buildHymnMainMarkup(
  hymn
) {

  const urduTitle =
    String(
      hymn?.urduTitle || ''
    ).trim()

  const romanTitle =
    String(
      hymn?.romanTitle || ''
    ).trim()

  const sections =
    parseCombinedLyrics({
      content:
        hymn?.content || '',
      urduTitle,
      romanTitle
    })


  const sectionMarkup =
    sections
      .map(
        section => {

          const urduLines =
            section.lines
              .filter(
                isUrduScriptLine
              )

          const romanLines =
            section.lines
              .filter(
                line =>
                  !isUrduScriptLine(
                    line
                  )
              )


          return `
            <section class="section">
              <div class="section-label">
                ${escapeHtml(
                  section.label
                )}
              </div>

              ${
                urduLines.length
                  ? `
                    <div class="urdu-block">
                      ${urduLines
                        .map(
                          escapeHtml
                        )
                        .join('<br>')}
                    </div>
                  `
                  : ''
              }

              ${
                romanLines.length
                  ? `
                    <div class="roman-block">
                      ${romanLines
                        .map(
                          escapeHtml
                        )
                        .join('<br>')}
                    </div>
                  `
                  : ''
              }
            </section>
          `
        }
      )
      .join('')


  return `
<main
  class="page"
  data-admin-geet-id="${escapeHtml(
    hymn?.id || ''
  )}"
  data-hymn-source-path="${escapeHtml(
    hymn?.sourcePath || ''
  )}"
>
  <header class="song-header">
    <h1 class="urdu-title">${escapeHtml(
      urduTitle
    )}</h1>
    <div class="roman-title">${escapeHtml(
      romanTitle
    )}</div>
  </header>
  ${sectionMarkup}
</main>`
}


export function applyHymnToDocument(
  doc,
  hymn
) {

  if (!doc) {
    return
  }


  const existingMain =
    doc.querySelector(
      'main.page'
    )


  if (!existingMain) {
    return
  }


  const wrapper =
    doc.createElement(
      'div'
    )

  wrapper.innerHTML =
    buildHymnMainMarkup(
      hymn
    )


  const replacement =
    wrapper.querySelector(
      'main.page'
    )


  if (!replacement) {
    return
  }


  existingMain.replaceWith(
    replacement
  )


  doc.title =
    String(
      hymn?.romanTitle ||
      hymn?.urduTitle ||
      doc.title ||
      'Hymn'
    ).trim()
}


function escapeHtml(
  value
) {

  return String(
    value ?? ''
  )
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
