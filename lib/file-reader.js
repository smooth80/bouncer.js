'use strict'

// dependencies
const { lookup } = require('mime-types');
const { existsSync, statSync, readFileSync } = require('fs')

module.exports = function (dist) {
  // adds dist folder context before any path
  function wrapPath(path) {
    return `./${dist}${path}`
  }

  // cache main index
  const index = {
    mime: getMime('index.html'),
    body: readFileSync(wrapPath('/index.html'), { encoding: 'utf8' })
  }

  // this is used as file reader cache
  return function fileReader(url) {
    const urlRelativeToDist = wrapPath(url)

    if (existsSync(urlRelativeToDist)) {
      if (statSync(urlRelativeToDist).isDirectory()) {
        const indexRelativeToDir = `${urlRelativeToDist}index.html`

        if (existsSync(indexRelativeToDir)) {
          // return file
          const body = readFileSync(indexRelativeToDir, { encoding: 'utf8' })
          const mime = getMime(indexRelativeToDir);

          return { mime, body }
        }
      }

      const body = readFileSync(urlRelativeToDist, { encoding: 'utf8' })
      const mime = getMime(urlRelativeToDist);

      return { mime, body }
    }

    return index
  }
}

function getMime(filename) {
  const mime = lookup(filename) || 'text/plain; charset=utf-8'

  console.log(filename, mime);

  return `${mime}`
}