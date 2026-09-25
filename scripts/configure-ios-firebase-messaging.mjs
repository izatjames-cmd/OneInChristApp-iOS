import {
  readFile,
  writeFile
} from 'node:fs/promises'

import {
  existsSync
} from 'node:fs'

import {
  resolve
} from 'node:path'


const projectRoot =
  process.cwd()

const appDelegatePath =
  resolve(
    projectRoot,
    'ios',
    'App',
    'App',
    'AppDelegate.swift'
  )


if (
  !existsSync(
    appDelegatePath
  )
) {
  throw new Error(
    `AppDelegate.swift was not found at ${appDelegatePath}`
  )
}


let source =
  await readFile(
    appDelegatePath,
    'utf8'
  )


function findAppDelegateClosingBrace(
  text
) {
  const classPattern =
    /class\s+AppDelegate\b[^{]*\{/

  const classMatch =
    classPattern.exec(
      text
    )

  if (
    !classMatch
  ) {
    throw new Error(
      'Could not find the AppDelegate class declaration.'
    )
  }

  const openingBraceIndex =
    classMatch.index +
    classMatch[0].lastIndexOf(
      '{'
    )

  let depth =
    0

  for (
    let index =
      openingBraceIndex;
    index <
      text.length;
    index +=
      1
  ) {
    const character =
      text[index]

    if (
      character ===
      '{'
    ) {
      depth +=
        1
    }

    if (
      character ===
      '}'
    ) {
      depth -=
        1

      if (
        depth ===
        0
      ) {
        return index
      }
    }
  }

  throw new Error(
    'Could not find the closing brace of the AppDelegate class.'
  )
}


function insertIntoAppDelegate(
  text,
  block
) {
  const closingBraceIndex =
    findAppDelegateClosingBrace(
      text
    )

  return (
    text.slice(
      0,
      closingBraceIndex
    ) +
    block +
    text.slice(
      closingBraceIndex
    )
  )
}


if (
  !source.includes(
    'import FirebaseAuth'
  )
) {
  const importMarker =
    'import Capacitor'

  if (
    !source.includes(
      importMarker
    )
  ) {
    throw new Error(
      'Could not find the Capacitor import in AppDelegate.swift.'
    )
  }

  source =
    source.replace(
      importMarker,
      `${importMarker}\nimport FirebaseAuth`
    )
}


const remoteNotificationMethods =
  []


if (
  !source.includes(
    'didRegisterForRemoteNotificationsWithDeviceToken'
  )
) {
  remoteNotificationMethods.push(
`    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
    }
`
  )
}


if (
  !source.includes(
    'didFailToRegisterForRemoteNotificationsWithError'
  )
) {
  remoteNotificationMethods.push(
`    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }
`
  )
}


if (
  !source.includes(
    'didReceiveRemoteNotification userInfo'
  )
) {
  remoteNotificationMethods.push(
`    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable : Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        NotificationCenter.default.post(
            name: Notification.Name.init("didReceiveRemoteNotification"),
            object: completionHandler,
            userInfo: userInfo
        )
    }
`
  )
}


if (
  remoteNotificationMethods.length >
  0
) {
  source =
    insertIntoAppDelegate(
      source,
      `\n${remoteNotificationMethods.join('\n')}\n`
    )
}


if (
  !source.includes(
    'Auth.auth().canHandle(url)'
  )
) {
  const proxyCallPattern =
    /return\s+ApplicationDelegateProxy\.shared\.application\(\s*app,\s*open:\s*url,\s*options:\s*options\s*\)/m

  if (
    proxyCallPattern.test(
      source
    )
  ) {
    source =
      source.replace(
        proxyCallPattern,
`if Auth.auth().canHandle(url) {
            return true
        }

        return ApplicationDelegateProxy.shared.application(
            app,
            open: url,
            options: options
        )`
      )
  }
  else {
    const openUrlMethod =
`    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey : Any] = [:]
    ) -> Bool {
        if Auth.auth().canHandle(url) {
            return true
        }

        return ApplicationDelegateProxy.shared.application(
            app,
            open: url,
            options: options
        )
    }
`

    source =
      insertIntoAppDelegate(
        source,
        `\n${openUrlMethod}\n`
      )
  }
}


await writeFile(
  appDelegatePath,
  source,
  'utf8'
)


console.log(
  'Firebase Messaging iOS AppDelegate bridge configured.'
)

console.log(
  '- Remote notification registration callbacks: ready'
)

console.log(
  '- Firebase Authentication URL handling: ready'
)
