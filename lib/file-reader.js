const { existsSync, statSync, readFileSync } = require('fs')

module.exports = function (dist) {
  // adds dist folder context before any path
  function wrapPath(path) {
    return `./${dist}/${path}`
  }

  // cache main index
  const mainIndex = readFileSync(wrapPath('index.html'), { encoding: 'utf8' })

  // this is used as file reader cache
  return function fileReader(url) {
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
