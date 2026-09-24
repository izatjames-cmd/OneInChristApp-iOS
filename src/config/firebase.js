import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDRPRxqxK-CxrLrBqZGuQt1UA-MbML7wHk',
  authDomain: 'one-in-christ-church.firebaseapp.com',
  projectId: 'one-in-christ-church',
  storageBucket: 'one-in-christ-church.firebasestorage.app',
  messagingSenderId: '654065189274',
  appId: '1:654065189274:web:1f45baed8a48fede013a23'
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app