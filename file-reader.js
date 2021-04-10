const { existsSync, statSync, readFileSync } = require('fs')

module.exports = function fileReader(dist) {
  function wrapPath(path) {
    return `./${dist}/${path}`
  }

  // cache main index
  const mainIndex = readFileSync(wrapPath('index.html'), { encoding: 'utf8' })

  return function (url) {
    const urlRelativeToDist = wrapPath(url)

    if (existsSync(urlRelativeToDist)) {
      if (statSync(urlRelativeToDist).isDirectory()) {
        const indexRelativeToDir = `${urlRelativeToDist}/index.html`

        if (existsSync(indexRelativeToDir)) {
          // return file
          return readFileSync(indexRelativeToDir, { encoding: 'utf8' })
        }
      }

      return readFileSync(urlRelativeToDist, { encoding: 'utf8' })
    }

    return mainIndex
  }
}
