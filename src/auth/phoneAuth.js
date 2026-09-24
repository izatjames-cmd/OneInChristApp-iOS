import { FirebaseAuthentication } from '@capacitor-firebase/authentication'

export async function createAccount(email, password) {
  const result =
    await FirebaseAuthentication.createUserWithEmailAndPassword({
      email,
      password
    })

  return result.user
}

export async function signInWithEmail(email, password) {
  const result =
    await FirebaseAuthentication.signInWithEmailAndPassword({
      email,
      password
    })

  return result.user
}

export async function sendVerificationEmail() {
  await FirebaseAuthentication.sendEmailVerification()
}

export async function getCurrentMember() {
  const result = await FirebaseAuthentication.getCurrentUser()
  return result.user
}

export async function signOutMember() {
  await FirebaseAuthentication.signOut()
}