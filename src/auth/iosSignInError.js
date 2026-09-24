import { Capacitor } from '@capacitor/core'

const DEFAULT_SIGN_IN_MESSAGE =
  'Email or password is incorrect.'


export function getMemberSignInErrorMessage(
  error
) {

  if (
    Capacitor.getPlatform() !== 'ios'
  ) {
    return DEFAULT_SIGN_IN_MESSAGE
  }


  const code =
    normalizeErrorValue(
      error?.code ||
      error?.error?.code
    )


  const message =
    normalizeErrorValue(
      error?.message ||
      error?.error?.message
    )


  if (code && message) {
    return `iPhone sign-in error (${code}): ${message}`
  }


  if (message) {
    return `iPhone sign-in error: ${message}`
  }


  if (code) {
    return `iPhone sign-in error: ${code}`
  }


  return 'iPhone sign-in failed. Please try again.'
}


function normalizeErrorValue(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {
    return ''
  }


  return String(value)
    .replace(/\s+/g, ' ')
    .trim()
}
