import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require =
  createRequire(
    import.meta.url
  )

const {
  getTokensFromDeviceData,
  uniqueTokens
} =
  require(
    '../functions/notificationTokens.js'
  )


test(
  'legacy Android token remains supported',
  () => {

    assert.deepEqual(
      getTokensFromDeviceData({
        token:
          'legacy-android-token'
      }),
      [
        'legacy-android-token'
      ]
    )
  }
)


test(
  'Android and iOS tokens can coexist',
  () => {

    assert.deepEqual(
      getTokensFromDeviceData({
        token:
          'android-token',

        androidToken:
          'android-token',

        iosToken:
          'ios-token'
      }),
      [
        'android-token',
        'ios-token'
      ]
    )
  }
)


test(
  'duplicate and blank tokens are removed',
  () => {

    assert.deepEqual(
      uniqueTokens([
        'android-token',
        '',
        'ios-token',
        'android-token',
        null
      ]),
      [
        'android-token',
        'ios-token'
      ]
    )
  }
)
