'use strict'

const sillyname = require('sillyname')
const wanakana = require('wanakana')

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

function randomize(a, b) {
  return Math.random() - Math.random() < 0 ? -1 : 1
}

function generateId({ lang = 'english', len = 5 }) {
  const id = sillyname()
  const toKana = wanakana.toHiragana(id)
  const trimmed = toKana.replace(/[a-z ]+/gi, '').replace(/(.{2})/gi, '$1')
  const scrambled = trimmed
    .split('')
    .sort(randomize)
    .map((str) => {
      if (lang === 'japanese') {
        return str
      }
      return wanakana.toRomaji(str).replace(/(?![a-z]+)/gi, '')
    })
    .join('')
    .substr(0, len)

  if (ids.has(scrambled)) {
    return generateId()
  }

  return scrambled
}

module.exports = {
  randomize,
  takeId,
  freeId,
  generateId
}
