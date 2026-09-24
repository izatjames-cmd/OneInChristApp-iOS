const CREED = {
  urdu: {
    label: 'اردو',
    title: 'رسولوں کا عقیدہ',
    dir: 'rtl',
    align: 'right',
    text: `میں ایمان رکھتا ہوں خدا قادرِ مطلق باپ پر، جس نے آسمان اور زمین کو پیدا کیا، اور اُس کے اکلوتے بیٹے ہمارے خداوند یسوع مسیح پر، جو روح القدس کی قدرت سے پیٹ میں پڑا۔ کنواری مریم سے پیدا ہوا۔ پنطس پیلاطس کی حکومت میں دُکھ اُٹھایا، مصلوب ہوا، مر گیا اور دفن ہوا۔ (عالمِ ارواح میں اُتر گیا۔) تیسرے دن مُردوں میں سے جی اُٹھا۔ آسمان پر چڑھ گیا اور خدا قادرِ مطلق باپ کی داہنی طرف بیٹھا ہے، جہاں سے وہ زندوں اور مُردوں کی عدالت کرنے کو آئے گا۔

میں ایمان رکھتا ہوں روح القدس پر، پاک کلیہ کلیسیا پر، مقدسوں کی رفاقت، گناہوں کی معافی، جسم کے جی اُٹھنے اور ہمیشہ کی زندگی پر۔ آمین۔`
  },
  danish: {
    label: 'Dansk',
    title: 'Den apostolske Trosbekendelse',
    dir: 'ltr',
    align: 'left',
    text: `I forsager Djævelen og alle hans gerninger og alt hans væsen.

Vi tror på Gud Fader, den Almægtige, himlens og jordens skaber.

Vi tror på Jesus Kristus, hans enbårne Søn, vor Herre, som er undfanget ved Helligånden, født af Jomfru Maria, pint under Pontius Pilatus, korsfæstet, død og begravet, nedfaret til dødsriget, på tredje dag opstanden fra de døde, opfaret til himmels, siddende ved Gud Faders, den Almægtiges, højre hånd, hvorfra han skal komme at dømme levende og døde.

Vi tror på Helligånden, den hellige, almindelige kirke, de helliges samfund, syndernes forladelse, kødets opstandelse og det evige liv.`
  },
  english: {
    label: 'English',
    title: "Apostles’ Creed",
    dir: 'ltr',
    align: 'left',
    text: `I believe in God, the Father almighty,
creator of heaven and earth.

I believe in Jesus Christ, God's only Son, our Lord,
who was conceived by the Holy Spirit,
born of the virgin Mary,
suffered under Pontius Pilate,
was crucified, died, and was buried;
he descended to the dead.*
On the third day he rose again;
he ascended into heaven,
he is seated at the right hand of the Father,
and he will come to judge the living and the dead.

I believe in the Holy Spirit,
the holy catholic church,
the communion of saints,
the forgiveness of sins,
the resurrection of the body,
and the life everlasting. Amen.`
  }
}


export function createApostlesCreedMarkup({
  id = 'apostles-creed',
  collapsedInitially = true,
  sectionTitle = "Apostles’ Creed"
} = {}) {

  const languages = [
    ['urdu', CREED.urdu],
    ['danish', CREED.danish],
    ['english', CREED.english]
  ]

  return `
    <section
      class="service-plan-section apostles-creed-reader"
      data-apostles-creed-reader="${escapeHtml(id)}"
      data-creed-collapsed="${collapsedInitially ? 'true' : 'false'}"
      style="
        border:1px solid #e4ddd4;
        border-radius:12px;
        padding:11px;
        margin-bottom:12px;
        background:#fffdf8;
      "
    >
      <h3 style="margin:0 0 10px;">
        ${escapeHtml(sectionTitle)}
      </h3>

      <div
        style="
          display:flex;
          gap:7px;
          flex-wrap:wrap;
          margin-bottom:0;
        "
      >
        ${languages.map(([language, item]) => `
          <button
            type="button"
            data-creed-language="${language}"
            aria-expanded="false"
            style="
              border:0;
              border-radius:8px;
              padding:9px 13px;
              background:#1976d2;
              color:#fff;
              font-weight:700;
            "
          >
            ${escapeHtml(item.label)}
          </button>
        `).join('')}
      </div>

      <div
        data-creed-content
        style="display:${collapsedInitially ? 'none' : 'block'}; margin-top:1em;"
      >
        <div
          data-creed-title
          style="
            font-weight:700;
            font-size:1.04rem;
            margin:0 0 1em;
          "
        ></div>

        <div
          data-creed-text
          style="
            white-space:pre-line;
            line-height:1.75;
            margin:0;
          "
        ></div>
      </div>
    </section>
  `
}


export function bindApostlesCreed(
  root
) {

  const reader =
    root?.matches?.('[data-apostles-creed-reader]')
      ? root
      : root?.querySelector?.('[data-apostles-creed-reader]')

  if (!reader || reader.dataset.creedBound === 'true') {
    return
  }

  reader.dataset.creedBound = 'true'

  const content =
    reader.querySelector('[data-creed-content]')

  const title =
    reader.querySelector('[data-creed-title]')

  const text =
    reader.querySelector('[data-creed-text]')

  let activeLanguage = ''

  const close = () => {
    activeLanguage = ''

    if (content) {
      content.style.display = 'none'
    }

    reader
      .querySelectorAll('[data-creed-language]')
      .forEach(button => {
        button.setAttribute(
          'aria-expanded',
          'false'
        )

        button.style.background =
          '#1976d2'
      })
  }

  reader
    .querySelectorAll('[data-creed-language]')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          const language =
            button.dataset.creedLanguage

          if (
            activeLanguage ===
            language
          ) {
            close()
            return
          }

          const item =
            CREED[language]

          if (
            !item ||
            !content ||
            !title ||
            !text
          ) {
            return
          }

          activeLanguage =
            language


          const isUrdu =
            language === 'urdu'


          title.textContent =
            item.title

          title.dir =
            item.dir

          title.style.textAlign =
            item.align

          title.classList.toggle(
            'urdu-text',
            isUrdu
          )


          text.textContent =
            item.text

          text.dir =
            item.dir

          text.style.textAlign =
            item.align

          text.classList.toggle(
            'urdu-text',
            isUrdu
          )


          content.style.display =
            'block'


          reader
            .querySelectorAll(
              '[data-creed-language]'
            )
            .forEach(other => {

              const active =
                other === button

              other.setAttribute(
                'aria-expanded',
                active
                  ? 'true'
                  : 'false'
              )

              other.style.background =
                active
                  ? '#0d47a1'
                  : '#1976d2'
            })
        }
      )
    })
}


export function bindAllApostlesCreeds(
  container = document
) {

  container
    ?.querySelectorAll?.(
      '[data-apostles-creed-reader]'
    )
    .forEach(
      bindApostlesCreed
    )
}


function escapeHtml(
  value
) {

  return String(
    value ??
    ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    )
}