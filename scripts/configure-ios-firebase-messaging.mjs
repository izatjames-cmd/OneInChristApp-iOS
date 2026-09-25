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


if (
  !source.includes(
    'didRegisterForRemoteNotificationsWithDeviceToken'
  )
) {

  const openUrlMarker =
    '    func application(_ app: UIApplication, open url: URL, options:'


  const openUrlIndex =
    source.indexOf(
      openUrlMarker
    )


  if (
    openUrlIndex ===
    -1
  ) {

    throw new Error(
      'Could not find the application open-url method in AppDelegate.swift.'
    )
  }


  const messagingBridge = `    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }

    func application(
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


  source =
    source.slice(
      0,
      openUrlIndex
    ) +
    messagingBridge +
    source.slice(
      openUrlIndex
    )
}


if (
  !source.includes(
    'Auth.auth().canHandle(url)'
  )
) {

  const proxyReturn =
    '        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)'


  if (
    !source.includes(
      proxyReturn
    )
  ) {

    throw new Error(
      'Could not find the Capacitor open-url proxy call in AppDelegate.swift.'
    )
  }


  const authAwareReturn =
`        if Auth.auth().canHandle(url) {
            return true
        }

${proxyReturn}`


  source =
    source.replace(
      proxyReturn,
      authAwareReturn
    )
}


await writeFile(
  appDelegatePath,
  source,
  'utf8'
)


console.log(
  'Firebase Messaging iOS AppDelegate bridge configured.'
)
