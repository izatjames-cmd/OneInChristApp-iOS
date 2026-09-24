import {
  Capacitor
} from '@capacitor/core'

import {
  InAppBrowser
} from '@capgo/capacitor-inappbrowser'

import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  getAdminAccess
} from '../auth/adminAccessStore.js'

import {
  getAdminGeet,
  getAdminGeetById,
  deleteAdminGeet,
  getBuiltInGeetCount
} from './adminGeetStore.js'

import {
  applyHymnToDocument,
  buildDynamicGeetHtml
} from './dynamicHymnRenderer.js'

import {
  extractHymnFromDocument
} from './hymnLyricsParser.js'

import {
  getAllBuiltInHymnEdits,
  getBuiltInHymnEdit
} from './hymnEditStore.js'

import {
  showHymnEditor
} from './hymnEditor.js'


const HYMNBOOK_INDEX =
  '/hymnbook/index.html'

const DYNAMIC_GEET_PREFIX =
  '/hymnbook/admin-geet/'

const OVERLAY_ID =
  'oneinchrist-hymnbook-overlay'

const EDITOR_ID =
  'oneinchrist-hymn-editor'


export async function browseOneInChristHymnbook(
  onSelected
) {

  const canManage =
    await canManageHymnbook()


  return showLocalHymnbook({
    selectionMode: true,
    initialUrl: HYMNBOOK_INDEX,
    onSelected,
    canManage
  })
}


export async function openHymnLyrics(
  url,
  title = '',
  options = {}
) {

  const value =
    String(
      url || ''
    ).trim()


  if (!value) {
    return
  }


  if (
    isLocalHymnbookUrl(
      value
    )
  ) {

    const canManage =
      options?.canManage === true
        ? true
        : await canManageHymnbook()


    await showLocalHymnbook({
      selectionMode: false,
      initialUrl:
        normalizeLocalHymnbookUrl(
          value
        ),
      title,
      canManage
    })

    return
  }


  /*
   * Existing Choir / Service plans may
   * still contain old Geet Ki Kitab or
   * other external links. Keep those
   * working instead of migrating or
   * deleting them.
   */
  if (
    Capacitor.isNativePlatform()
  ) {

    await InAppBrowser.openWebView({
      url: value,
      toolbarType: 'navigation',
      enabledSafeTopMargin: true,
      enabledSafeBottomMargin: true
    })

    return
  }


  window.open(
    value,
    '_blank'
  )
}


export function isLocalHymnbookUrl(
  value
) {

  const raw =
    String(
      value || ''
    ).trim()


  if (!raw) {
    return false
  }


  if (
    raw.startsWith(
      '/hymnbook/'
    ) ||
    raw.startsWith(
      'hymnbook/'
    )
  ) {
    return true
  }


  try {

    const parsed =
      new URL(
        raw,
        window.location.href
      )


    return (
      parsed.origin ===
        window.location.origin &&
      parsed.pathname.startsWith(
        '/hymnbook/'
      )
    )

  } catch {

    return false
  }
}


function normalizeLocalHymnbookUrl(
  value
) {

  const raw =
    String(
      value || ''
    ).trim()


  if (
    raw.startsWith(
      'hymnbook/'
    )
  ) {
    return `/${raw}`
  }


  try {

    const parsed =
      new URL(
        raw,
        window.location.href
      )


    if (
      parsed.origin ===
        window.location.origin &&
      parsed.pathname.startsWith(
        '/hymnbook/'
      )
    ) {

      return (
        parsed.pathname +
        parsed.search +
        parsed.hash
      )
    }

  } catch {
    // Fall through and return raw value.
  }


  return raw
}


async function canManageHymnbook() {

  try {

    const user =
      await getCurrentMember()


    if (!user?.uid) {
      return false
    }


    const access =
      await getAdminAccess(
        user.uid
      )


    return (
      access?.choirAdmin === true ||
      access?.choirPlanning === true ||
      access?.churchAdmin === true
    )

  } catch (error) {

    console.warn(
      'Unable to read hymnbook admin access:',
      error
    )

    return false
  }
}


function showLocalHymnbook({
  selectionMode,
  initialUrl,
  onSelected,
  title = '',
  canManage = false
}) {

  return new Promise(
    resolve => {

      const oldOverlay =
        document.getElementById(
          OVERLAY_ID
        )


      if (oldOverlay) {
        oldOverlay.remove()
      }


      document
        .getElementById(
          EDITOR_ID
        )
        ?.remove()


      const overlay =
        document.createElement(
          'div'
        )


      overlay.id =
        OVERLAY_ID


      Object.assign(
        overlay.style,
        {
          position: 'fixed',
          inset: '0',
          zIndex: '2147483646',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column'
        }
      )


      const toolbar =
        document.createElement(
          'div'
        )


      Object.assign(
        toolbar.style,
        {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          padding:
            'max(10px, env(safe-area-inset-top)) 10px 10px',
          borderBottom:
            '1px solid #dddddd',
          background: '#ffffff'
        }
      )


      const backButton =
        createToolbarButton(
          'Back'
        )

      backButton.dataset.hymnbookBack =
        'true'

      const indexButton =
        createToolbarButton(
          'Hymnbook Index'
        )

      const closeButton =
        createToolbarButton(
          'Close'
        )


      const addButton =
        canManage
          ? createToolbarButton(
              '+ Add New Geet'
            )
          : null


      const editButton =
        canManage
          ? createToolbarButton(
              'Edit Geet'
            )
          : null


      const deleteButton =
        canManage
          ? createToolbarButton(
              'Delete Geet'
            )
          : null


      if (editButton) {
        editButton.style.display =
          'none'
      }


      if (deleteButton) {
        deleteButton.style.display =
          'none'
      }


      const searchInput =
        canManage
          ? document.createElement(
              'input'
            )
          : null


      if (searchInput) {
        searchInput.type =
          'search'

        searchInput.placeholder =
          'Search Geet / Zaboor'

        searchInput.setAttribute(
          'aria-label',
          'Search hymnbook'
        )

        Object.assign(
          searchInput.style,
          {
            flex: '1 1 190px',
            minWidth: '150px',
            maxWidth: '280px',
            padding: '9px 10px',
            border: '1px solid #cccccc',
            borderRadius: '8px',
            fontSize: '14px'
          }
        )
      }


      const status =
        document.createElement(
          'div'
        )


      Object.assign(
        status.style,
        {
          flex: '1 1 180px',
          minWidth: '120px',
          fontSize: '13px',
          lineHeight: '1.35',
          color: '#333333'
        }
      )


      status.textContent =
        selectionMode
          ? 'Open a Geet or Zaboor, then choose Select this hymn.'
          : (
              title ||
              'One in Christ Hymnbook'
            )


      let selectButton =
        null


      if (selectionMode) {

        selectButton =
          createToolbarButton(
            'Select this hymn'
          )


        selectButton.disabled =
          true


        Object.assign(
          selectButton.style,
          {
            fontWeight: '700'
          }
        )
      }


      toolbar.appendChild(
        backButton
      )

      toolbar.appendChild(
        indexButton
      )


      if (addButton) {
        toolbar.appendChild(
          addButton
        )
      }


      if (editButton) {
        toolbar.appendChild(
          editButton
        )
      }


      if (deleteButton) {
        toolbar.appendChild(
          deleteButton
        )
      }


      if (searchInput) {
        toolbar.appendChild(
          searchInput
        )
      }


      toolbar.appendChild(
        status
      )


      if (selectButton) {
        toolbar.appendChild(
          selectButton
        )
      }


      toolbar.appendChild(
        closeButton
      )


      const frame =
        document.createElement(
          'iframe'
        )


      frame.title =
        'One in Christ Hymnbook'


      Object.assign(
        frame.style,
        {
          border: '0',
          width: '100%',
          flex: '1 1 auto',
          minHeight: '0',
          background: '#ffffff'
        }
      )


      overlay.appendChild(
        toolbar
      )

      overlay.appendChild(
        frame
      )

      document.body.appendChild(
        overlay
      )


      let currentHymn =
        null

      let activeDynamicGeet =
        null

      let activeBuiltInHymn =
        null

      let activeOriginalBuiltInHymn =
        null

      let finished =
        false


      const updateAdminActions =
        () => {

          if (!canManage) {
            return
          }


          const canEdit =
            Boolean(
              activeDynamicGeet ||
              activeBuiltInHymn
            )


          if (editButton) {
            editButton.style.display =
              canEdit
                ? 'inline-block'
                : 'none'

            editButton.textContent =
              activeBuiltInHymn?.type === 'zaboor'
                ? 'Edit Zaboor'
                : 'Edit Geet'
          }


          if (deleteButton) {
            deleteButton.style.display =
              activeDynamicGeet
                ? 'inline-block'
                : 'none'
          }
        }


      const setCurrentDynamicHymn =
        geet => {

          activeDynamicGeet =
            geet

          activeBuiltInHymn =
            null

          activeOriginalBuiltInHymn =
            null


          currentHymn = {
            title:
              geet.romanTitle ||
              geet.urduTitle ||
              'Geet',

            romanTitle:
              geet.romanTitle ||
              '',

            urduTitle:
              geet.urduTitle ||
              '',

            url:
              `${DYNAMIC_GEET_PREFIX}${encodeURIComponent(
                geet.id
              )}`
          }


          status.textContent =
            currentHymn.title


          if (selectButton) {
            selectButton.disabled =
              false
          }


          updateAdminActions()
        }


      const setCurrentBuiltInHymn = ({
        hymn,
        original
      }) => {

        activeDynamicGeet =
          null

        activeBuiltInHymn =
          hymn

        activeOriginalBuiltInHymn =
          original


        currentHymn = {
          title:
            hymn.romanTitle ||
            hymn.urduTitle ||
            (
              hymn.type === 'zaboor'
                ? 'Zaboor'
                : 'Geet'
            ),

          romanTitle:
            hymn.romanTitle ||
            '',

          urduTitle:
            hymn.urduTitle ||
            '',

          url:
            hymn.sourcePath ||
            original?.sourcePath ||
            ''
        }


        status.textContent =
          currentHymn.title


        if (selectButton) {
          selectButton.disabled =
            false
        }


        updateAdminActions()
      }


      const renderDynamicGeet =
        geet => {

          if (!geet?.id) {
            return
          }


          activeDynamicGeet =
            geet


          frame.srcdoc =
            buildDynamicGeetHtml(
              geet
            )


          setCurrentDynamicHymn(
            geet
          )
        }


      const renderBuiltInHymn = ({
        hymn,
        original
      }) => {

        const doc =
          frame.contentDocument


        if (!doc) {
          return
        }


        applyHymnToDocument(
          doc,
          hymn
        )


        setCurrentBuiltInHymn({
          hymn,
          original
        })
      }


      const refreshBuiltInHymn =
        async sourcePath => {

          const original =
            activeOriginalBuiltInHymn


          if (!original) {
            return
          }


          const edit =
            await getBuiltInHymnEdit(
              sourcePath ||
              original.sourcePath
            )


          const hymn =
            edit
              ? {
                  ...original,
                  ...edit,
                  sourceType:
                    'built-in',
                  sourcePath:
                    original.sourcePath,
                  type:
                    original.type,
                  isEdited:
                    true
                }
              : {
                  ...original,
                  sourceType:
                    'built-in',
                  isEdited:
                    false
                }


          renderBuiltInHymn({
            hymn,
            original
          })
        }


      const openIndex =
        () => {

          activeDynamicGeet =
            null

          activeBuiltInHymn =
            null

          activeOriginalBuiltInHymn =
            null

          currentHymn =
            null


          updateAdminActions()


          if (selectButton) {
            selectButton.disabled =
              true
          }


          frame.removeAttribute(
            'srcdoc'
          )

          frame.src =
            `${HYMNBOOK_INDEX}?refresh=${Date.now()}`
        }


      const openDynamicById =
        async geetId => {

          status.textContent =
            'Loading Geet...'


          try {

            const geet =
              await getAdminGeetById(
                geetId
              )


            if (!geet) {
              throw new Error(
                'This Geet could not be found.'
              )
            }


            renderDynamicGeet(
              geet
            )

          } catch (error) {

            console.error(
              'Unable to load admin-added Geet:',
              error
            )


            status.textContent =
              'Unable to load this Geet.'


            openIndex()
          }
        }


      const finish = (
        selected = null
      ) => {

        if (finished) {
          return
        }


        finished =
          true


        document.removeEventListener(
          'keydown',
          onKeyDown
        )


        document
          .getElementById(
            EDITOR_ID
          )
          ?.remove()


        overlay.remove()


        if (
          selected &&
          typeof onSelected ===
            'function'
        ) {

          onSelected(
            selected
          )
        }


        resolve(
          selected
        )
      }


      const onKeyDown =
        event => {

          if (
            event.key ===
              'Escape' &&
            !document.getElementById(
              EDITOR_ID
            )
          ) {
            finish()
          }
        }


      document.addEventListener(
        'keydown',
        onKeyDown
      )


      closeButton.addEventListener(
        'click',
        () => finish()
      )


      indexButton.addEventListener(
        'click',
        openIndex
      )


      if (searchInput) {
        searchInput.addEventListener(
          'input',
          () => {

            if (currentHymn) {
              openIndex()
              return
            }


            const doc =
              frame.contentDocument


            if (doc) {
              applyIndexSearch(
                doc,
                searchInput.value
              )
            }
          }
        )
      }


      backButton.addEventListener(
        'click',
        () => {

          if (
            activeDynamicGeet ||
            activeBuiltInHymn
          ) {
            openIndex()
            return
          }


          /*
           * When a hymn is open, Back returns to the hymnbook index.
           * When the index itself is open, Back closes the hymnbook and
           * returns to the Choir/previous screen underneath.
           */
          if (!currentHymn) {
            finish()
            return
          }


          try {

            frame.contentWindow
              ?.history
              ?.back()

          } catch {

            openIndex()
          }
        }
      )


      if (selectButton) {

        selectButton.addEventListener(
          'click',
          () => {

            if (!currentHymn) {
              return
            }


            finish({
              ...currentHymn
            })
          }
        )
      }


      if (addButton) {

        addButton.addEventListener(
          'click',
          () => {

            showHymnEditor({
              hymn:
                null,
              sourceType:
                'admin-geet',

              onSaved:
                saved => {
                  renderDynamicGeet(
                    saved
                  )
                }
            })
          }
        )
      }


      if (editButton) {

        editButton.addEventListener(
          'click',
          () => {

            if (activeDynamicGeet) {

              showHymnEditor({
                hymn:
                  activeDynamicGeet,
                sourceType:
                  'admin-geet',

                onSaved:
                  saved => {
                    renderDynamicGeet(
                      saved
                    )
                  }
              })

              return
            }


            if (
              activeBuiltInHymn &&
              activeOriginalBuiltInHymn
            ) {

              showHymnEditor({
                hymn:
                  activeBuiltInHymn,
                original:
                  activeOriginalBuiltInHymn,
                sourceType:
                  'built-in',

                onSaved:
                  async () => {
                    await refreshBuiltInHymn(
                      activeOriginalBuiltInHymn.sourcePath
                    )
                  }
              })
            }
          }
        )
      }


      if (deleteButton) {

        deleteButton.addEventListener(
          'click',
          async () => {

            if (!activeDynamicGeet) {
              return
            }


            const confirmed =
              window.confirm(
                `Delete "${
                  activeDynamicGeet.romanTitle ||
                  activeDynamicGeet.urduTitle ||
                  'this Geet'
                }" from the hymnbook?\n\nThe original built-in hymnbook will not be changed.`
              )


            if (!confirmed) {
              return
            }


            deleteButton.disabled =
              true

            status.textContent =
              'Deleting Geet...'


            try {

              await deleteAdminGeet(
                activeDynamicGeet.id
              )


              openIndex()

            } catch (error) {

              console.error(
                'Unable to delete Geet:',
                error
              )


              status.textContent =
                'Unable to delete this Geet.'

              alert(
                'The Geet could not be deleted. Please check your internet connection and admin access.'
              )

            } finally {

              deleteButton.disabled =
                false
            }
          }
        )
      }


      frame.addEventListener(
        'load',
        async () => {

          if (activeDynamicGeet) {

            setCurrentDynamicHymn(
              activeDynamicGeet
            )

            return
          }


          try {

            const doc =
              frame.contentDocument

            const frameWindow =
              frame.contentWindow


            if (
              !doc ||
              !frameWindow
            ) {
              return
            }


            const current =
              new URL(
                frameWindow.location.href
              )

            const path =
              current.pathname

            const decodedPath =
              decodeURIComponent(
                path
              )


            if (
              decodedPath ===
                HYMNBOOK_INDEX
            ) {

              currentHymn =
                null

              activeDynamicGeet =
                null

              activeBuiltInHymn =
                null

              activeOriginalBuiltInHymn =
                null

              updateAdminActions()


              if (selectButton) {
                selectButton.disabled =
                  true
              }


              if (selectionMode) {
                status.textContent =
                  'Choose a Geet or Zaboor from the hymnbook.'
              } else {
                status.textContent =
                  'One in Christ Hymnbook'
              }


              await enhanceHymnbookIndex({
                doc,
                onOpenDynamic:
                  renderDynamicGeet
              })


              if (searchInput) {
                applyIndexSearch(
                  doc,
                  searchInput.value
                )
              }


              return
            }


            const isHymnPage =
              (
                decodedPath.startsWith(
                  '/hymnbook/Songs/'
                ) ||
                decodedPath.startsWith(
                  '/hymnbook/zaboor/'
                )
              ) &&
              decodedPath
                .toLowerCase()
                .endsWith(
                  '.html'
                ) &&
              !decodedPath
                .toLowerCase()
                .endsWith(
                  '/zaboor/index.html'
                )


            if (!isHymnPage) {

              currentHymn =
                null

              activeDynamicGeet =
                null

              activeBuiltInHymn =
                null

              activeOriginalBuiltInHymn =
                null


              if (selectButton) {
                selectButton.disabled =
                  true
              }


              if (selectionMode) {

                status.textContent =
                  'Choose a Geet or Zaboor from the hymnbook.'
              }


              updateAdminActions()

              return
            }


            const original =
              extractHymnFromDocument(
                doc,
                decodedPath
              )


            if (!original) {
              throw new Error(
                'The hymn text could not be read.'
              )
            }


            activeOriginalBuiltInHymn =
              original


            const edit =
              await getBuiltInHymnEdit(
                decodedPath
              )


            const hymn =
              edit
                ? {
                    ...original,
                    ...edit,
                    sourceType:
                      'built-in',
                    sourcePath:
                      decodedPath,
                    type:
                      original.type,
                    isEdited:
                      true
                  }
                : {
                    ...original,
                    sourceType:
                      'built-in',
                    isEdited:
                      false
                  }


            if (edit) {
              applyHymnToDocument(
                doc,
                hymn
              )
            }


            setCurrentBuiltInHymn({
              hymn,
              original
            })


            currentHymn.url =
              path +
              current.search +
              current.hash

          } catch (error) {

            console.error(
              'Unable to read local hymn page:',
              error
            )


            currentHymn =
              null


            if (selectButton) {
              selectButton.disabled =
                true
            }
          }
        }
      )


      const normalizedInitial =
        normalizeLocalHymnbookUrl(
          initialUrl ||
          HYMNBOOK_INDEX
        )


      const initialDynamicId =
        getDynamicGeetId(
          normalizedInitial
        )


      if (initialDynamicId) {

        frame.src =
          'about:blank'


        openDynamicById(
          initialDynamicId
        )

      } else {

        frame.src =
          normalizedInitial
      }
    }
  )
}


async function enhanceHymnbookIndex({
  doc,
  onOpenDynamic
}) {

  try {

    const [
      adminGeet,
      builtInEdits
    ] =
      await Promise.all([
        getAdminGeet(),
        getAllBuiltInHymnEdits()
      ])


    applyBuiltInEditsToIndex(
      doc,
      builtInEdits
    )


    const subtitle =
      doc.querySelector(
        'header .subtitle'
      )


    if (subtitle) {

      subtitle.textContent =
        `${
          getBuiltInGeetCount() +
          adminGeet.length
        } songs`
    }


    const geetCollection =
      doc.querySelector(
        'details[aria-label="Geet collection"]'
      )

    const letterMenu =
      geetCollection
        ?.querySelector(
          '.letter-menu'
        )


    if (!letterMenu) {
      return
    }


    adminGeet.forEach(
      geet => {

        const letter =
          getRomanFirstLetter(
            geet.romanTitle
          )

        const group =
          getOrCreateLetterGroup(
            doc,
            letterMenu,
            letter
          )

        const list =
          group.querySelector(
            'ul'
          )


        if (!list) {
          return
        }


        const li =
          doc.createElement(
            'li'
          )

        const link =
          doc.createElement(
            'a'
          )


        link.href =
          `${DYNAMIC_GEET_PREFIX}${encodeURIComponent(
            geet.id
          )}`

        link.dataset.adminGeetId =
          geet.id


        const urdu =
          doc.createElement(
            'span'
          )

        urdu.className =
          'urdu-title'

        urdu.textContent =
          geet.urduTitle ||
          'گیت'


        const roman =
          doc.createElement(
            'span'
          )

        roman.className =
          'roman-title'

        roman.textContent =
          shortenHymnIndexTitle(
            geet.romanTitle ||
            `Geet ${
              geet.geetNumber || ''
            }`,
            7
          )


        link.appendChild(
          urdu
        )

        link.appendChild(
          roman
        )


        link.addEventListener(
          'click',
          event => {

            event.preventDefault()

            onOpenDynamic?.(
              geet
            )
          }
        )


        li.appendChild(
          link
        )

        list.appendChild(
          li
        )


        sortLetterList(
          list
        )
      }
    )

  } catch (error) {

    /*
     * The bundled hymnbook must keep
     * working even if Firestore is
     * offline or the user cannot read
     * the dynamic collection.
     */
    console.warn(
      'Unable to load admin-added Geet:',
      error
    )
  }
}


function applyBuiltInEditsToIndex(
  doc,
  edits
) {

  if (
    !doc ||
    !Array.isArray(edits) ||
    !edits.length
  ) {
    return
  }


  const editMap =
    new Map(
      edits.map(
        edit => [
          normalizeHymnPath(
            edit.sourcePath
          ),
          edit
        ]
      )
    )


  doc
    .querySelectorAll(
      'a[href]'
    )
    .forEach(
      link => {

        let path =
          ''


        try {
          path =
            decodeURIComponent(
              new URL(
                link.href
              ).pathname
            )
        } catch {
          return
        }


        const edit =
          editMap.get(
            normalizeHymnPath(
              path
            )
          )


        if (!edit) {
          return
        }


        const urdu =
          link.querySelector(
            '.urdu-title'
          )

        const roman =
          link.querySelector(
            '.roman-title'
          )


        if (urdu) {
          urdu.textContent =
            edit.urduTitle ||
            urdu.textContent
        }


        if (roman) {
          roman.textContent =
            shortenHymnIndexTitle(
              edit.romanTitle ||
              roman.textContent,
              7
            )
        }


        link.dataset.hymnEdited =
          'true'
      }
    )
}


function applyIndexSearch(
  doc,
  value
) {

  if (!doc) {
    return
  }


  const query =
    normalizeSearchText(
      value
    )


  const collectionGroups =
    Array.from(
      doc.querySelectorAll(
        'details.collection-group'
      )
    )


  collectionGroups.forEach(
    collection => {

      let collectionHasMatch =
        false

      const letterGroups =
        Array.from(
          collection.querySelectorAll(
            'details.letter-group'
          )
        )


      letterGroups.forEach(
        group => {

          let groupHasMatch =
            false

          const items =
            Array.from(
              group.querySelectorAll(
                ':scope > ul > li'
              )
            )


          items.forEach(
            item => {

              const link =
                item.querySelector(
                  'a'
                )

              const haystack =
                normalizeSearchText(
                  `${link?.textContent || ''} ${link?.getAttribute('href') || ''}`
                )

              const matches =
                !query ||
                haystack.includes(
                  query
                )


              item.style.display =
                matches
                  ? ''
                  : 'none'


              if (matches) {
                groupHasMatch =
                  true
                collectionHasMatch =
                  true
              }
            }
          )


          group.style.display =
            groupHasMatch ||
            !query
              ? ''
              : 'none'


          if (query && groupHasMatch) {
            group.open =
              true
          }
        }
      )


      const directItems =
        Array.from(
          collection.querySelectorAll(
            ':scope > ul > li'
          )
        )


      directItems.forEach(
        item => {

          const link =
            item.querySelector(
              'a'
            )

          const haystack =
            normalizeSearchText(
              `${link?.textContent || ''} ${link?.getAttribute('href') || ''}`
            )

          const matches =
            !query ||
            haystack.includes(
              query
            )


          item.style.display =
            matches
              ? ''
              : 'none'


          if (matches) {
            collectionHasMatch =
              true
          }
        }
      )


      collection.style.display =
        collectionHasMatch ||
        !query
          ? ''
          : 'none'


      if (query && collectionHasMatch) {
        collection.open =
          true
      }
    }
  )
}


function normalizeSearchText(
  value
) {

  return String(
    value || ''
  )
    .normalize(
      'NFD'
    )
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .toLocaleLowerCase()
}


function normalizeHymnPath(
  value
) {

  const path =
    String(
      value || ''
    ).trim()


  if (!path) {
    return ''
  }


  return path.startsWith('/')
    ? path
    : `/${path}`
}


function getOrCreateLetterGroup(
  doc,
  letterMenu,
  letter
) {

  const groups =
    Array.from(
      letterMenu.querySelectorAll(
        ':scope > details.letter-group'
      )
    )


  const found =
    groups.find(
      group => {

        const summary =
          group.querySelector(
            ':scope > summary'
          )

        const text =
          String(
            summary?.textContent || ''
          )
            .trim()
            .toUpperCase()


        return (
          text === letter ||
          text.startsWith(
            `${letter} `
          ) ||
          text.startsWith(
            `${letter}—`
          ) ||
          text.startsWith(
            `${letter} —`
          )
        )
      }
    )


  if (found) {
    return found
  }


  const details =
    doc.createElement(
      'details'
    )

  details.className =
    'letter-group'


  const summary =
    doc.createElement(
      'summary'
    )

  summary.textContent =
    letter


  const list =
    doc.createElement(
      'ul'
    )


  details.appendChild(
    summary
  )

  details.appendChild(
    list
  )

  letterMenu.appendChild(
    details
  )


  return details
}


function sortLetterList(
  list
) {

  const items =
    Array.from(
      list.children
    )


  items.sort(
    (first, second) => {

      const firstTitle =
        first.querySelector(
          '.roman-title'
        )
          ?.textContent ||
        first.textContent ||
        ''

      const secondTitle =
        second.querySelector(
          '.roman-title'
        )
          ?.textContent ||
        second.textContent ||
        ''


      return firstTitle.localeCompare(
        secondTitle,
        'en',
        {
          sensitivity: 'base'
        }
      )
    }
  )


  items.forEach(
    item =>
      list.appendChild(
        item
      )
  )
}


function shortenHymnIndexTitle(
  value,
  maxWords = 7
) {

  const words =
    String(
      value ||
      ''
    )
      .trim()
      .split(
        /\s+/
      )
      .filter(Boolean)


  return words
    .slice(
      0,
      Math.max(
        1,
        Number(maxWords) || 7
      )
    )
    .join(
      ' '
    )
}


function getRomanFirstLetter(
  value
) {

  const normalized =
    String(
      value || ''
    )
      .normalize(
        'NFD'
      )
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .trim()
      .toUpperCase()


  const match =
    normalized.match(
      /[A-Z]/
    )


  return match?.[0] ||
    '#'
}


function getDynamicGeetId(
  value
) {

  const raw =
    String(
      value || ''
    ).trim()


  let pathname =
    raw


  try {

    pathname =
      new URL(
        raw,
        window.location.href
      ).pathname

  } catch {
    // Use raw path.
  }


  if (
    !pathname.startsWith(
      DYNAMIC_GEET_PREFIX
    )
  ) {
    return ''
  }


  return decodeURIComponent(
    pathname.slice(
      DYNAMIC_GEET_PREFIX.length
    )
  )
}


function createToolbarButton(
  text
) {

  const button =
    document.createElement(
      'button'
    )


  button.type =
    'button'

  button.textContent =
    text


  Object.assign(
    button.style,
    {
      padding: '9px 11px',
      border: '1px solid #cccccc',
      borderRadius: '8px',
      background: '#ffffff',
      color: '#111111',
      cursor: 'pointer'
    }
  )


  return button
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


function escapeAttribute(
  value
) {
  return escapeHtml(
    value
  )
}
