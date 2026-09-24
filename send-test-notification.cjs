const { initializeApp, cert } = require('firebase-admin/app')
const { getMessaging } = require('firebase-admin/messaging')

const serviceAccount = require(
  'C:/Users/Jam/Downloads/one-in-christ-church-firebase-adminsdk-fbsvc-9043a62b82.json'
)

const token = process.env.FCM_TOKEN

if (!token) {
  console.error('FCM_TOKEN is missing.')
  process.exit(1)
}

initializeApp({
  credential: cert(serviceAccount)
})

const message = {
  token: token,
  notification: {
    title: 'One in Christ Church',
    body: 'Direct Firebase test notification'
  }
}

getMessaging()
  .send(message)
  .then((response) => {
    console.log('SUCCESS')
    console.log('Firebase message ID:', response)
    process.exit(0)
  })
  .catch((error) => {
    console.error('FAILED')
    console.error(error)
    process.exit(1)
  })