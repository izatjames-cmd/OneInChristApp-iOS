export function returnToMemberArea() {

  const memberArea =
    document.querySelector(
      '#member-area-overlay'
    )

  if (!memberArea) {
    return
  }

  memberArea.style.display =
    'flex'
}
