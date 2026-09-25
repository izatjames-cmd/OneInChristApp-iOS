function getTokensFromDeviceData(
  data = {}
) {

  return [
    data.token,
    data.androidToken,
    data.iosToken
  ]
    .filter(
      token =>
        typeof token ===
          'string' &&
        token.trim() !== ''
    )
    .map(
      token =>
        token.trim()
    )
    .filter(
      (
        token,
        index,
        tokens
      ) =>
        tokens.indexOf(
          token
        ) ===
        index
    )
}


function uniqueTokens(
  tokens = []
) {

  return [
    ...new Set(
      tokens.filter(
        Boolean
      )
    )
  ]
}


module.exports = {
  getTokensFromDeviceData,
  uniqueTokens
}
