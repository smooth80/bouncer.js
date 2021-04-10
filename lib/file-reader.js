'use strict'

// dependencies
const { lookup } = require('mime-types')
const { existsSync, statSync, readFileSync } = require('fs')

module.exports = function (dist) {
  // adds dist folder context before any path
  function wrapPath(path) {
    return `./${dist}${path}`
  }

  // cache main index
  const prefix = wrapPath('')
  const mainIndexFile = wrapPath('/index.html')
  const mainIndex = {
    mime: getMime(mainIndexFile),
    body: readFileSync(mainIndexFile, { encoding: 'utf8' }),
    filename: mainIndexFile.replace(prefix, '')
  }

  // this is used as file reader cache
  return function fileReader(url) {
    const filename = wrapPath(url)

    if (existsSync(filename)) {
      if (statSync(filename).isDirectory()) {
        const index = `${filename}index.html`

        if (existsSync(index)) {
          const mime = getMime(index)
          const body = readFileSync(index, { encoding: 'utf8' })

          return { mime, body, filename: index.replace(prefix, '') }
        }
      }

      const mime = getMime(filename)
      const body = readFileSync(filename)

      return { mime, body, filename: filename.replace(prefix, '') }
    }

    return mainIndex
  }
}

function getMime(filename) {
  const mime = lookup(filename) || 'text/plain; charset=utf-8'

  return `${mime}`
}
