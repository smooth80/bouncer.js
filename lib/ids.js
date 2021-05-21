'use strict'

const ids = new Set()

function takeId(id) {
  if (!ids.has(id)) {
    ids.add(id)

    return true
  }

  return false
}

function freeId(id) {
  if (ids.has(id)) {
    ids.delete(id)

    return true
  }

  return false
}

function generateId() {
  const id = Math.random().toString(36).replace('.', '')

  if (ids.has(id)) {
    return generateId()
  }

  takeId(id)

  return id
}

module.exports = {
  takeId,
  freeId,
  generateId
}
