export const SERVICE_EXPIRY_HOURS =
  24


export function getServiceStartDate(
  plan
) {

  if (!plan?.date) {
    return null
  }


  const serviceTime =
    plan.serviceTime ||
    '00:00'


  const date =
    new Date(
      `${plan.date}T${serviceTime}:00`
    )


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null
  }


  return date
}


export function isAutomaticallyExpired(
  plan
) {

  const serviceStart =
    getServiceStartDate(
      plan
    )


  if (!serviceStart) {
    return false
  }


  const expiryTime =
    serviceStart.getTime() +
    SERVICE_EXPIRY_HOURS *
    60 *
    60 *
    1000


  return (
    Date.now() >=
    expiryTime
  )
}


export function isArchivedPlan(
  plan
) {

  return (
    plan?.archived === true ||
    isAutomaticallyExpired(
      plan
    )
  )
}


export function isVisiblePlan(
  plan
) {

  if (
    plan?.active !== true
  ) {

    return false
  }


  return !isArchivedPlan(
    plan
  )
}
