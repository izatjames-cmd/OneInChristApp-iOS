let currentApprovedMember = null
let currentAdminFoodEvent = null
let foodAdminMode = 'edit'


export function getApprovedMember() {
  return currentApprovedMember
}


export function setApprovedMember(member) {
  currentApprovedMember = member
}


export function getAdminFoodEvent() {
  return currentAdminFoodEvent
}


export function setAdminFoodEvent(event) {
  currentAdminFoodEvent = event
}


export function getFoodAdminMode() {
  return foodAdminMode
}


export function setFoodAdminMode(mode) {
  foodAdminMode = mode
}