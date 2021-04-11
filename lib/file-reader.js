'use strict'

// dependencies
const { join } = require('path')
const { lookup } = require('mime-types')
const { existsSync, readFileSync } = require('fs')

module.exports = function (dist) {
  // cache main index
  const indexUrl = join(dist, 'index.html')
  const index = readFileSync(indexUrl, { encoding: 'utf8' })

  // this is used as file reader cache
  return function fileReader(url) {
    const mime = lookup(url)
    const filename = join(dist, url)

    // folder?
    if (!mime) {
      return fileReader(`${url}index.html`)
    }

    if (existsSync(filename)) {
      const body = readFileSync(filename)

      return { mime, body, status: 200 }
    }

    return { mime, body: index, status: 301 }
  }
}
