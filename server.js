'use strict'

// dependencies
const Cache = require('latermom')
const BouncerJs = require('.')
const fileReader = require('./lib/file-reader')

/**
 * static files server, returning bouncer instance
 * @param {string?} dist
 * @param {object?} plugins
 * @param {object?} config
 * @returns BouncerJS
 */
function server(
  // first argument is directory you want to static serve
  dist = 'dist',
  // second argument is plugins object with functions - more in README.md
  plugins = {},
  // extra configuration for bouncer
  config = {}
) {
  // get bouncer from second argument
  const bouncer =
    arguments.length === 2
      ? arguments[1]
      : new BouncerJs({ ...config, plugins })
  // init cache with fileReader on dist folder
  const cache = new Cache(fileReader(dist))

  // process all requests
  bouncer.router.get('/*', (res, req) => {
    const url = req.getUrl()
    const { mime, body, status } = cache.get(url)

    if (bouncer.config.debug) {
      console.info(status, 'GET', mime, url)
    }

    // send 200 for google seo
    res.writeStatus('200 OK')

    // check based on real status from file-reader
    switch (status) {
      case 301:
        const index = cache.get('/index.html')

        res.writeHeader('Content-Type', index.mime)
        res.end(index.body)
        break

      default:
        res.writeHeader('Content-Type', mime)
        res.end(body)
        break
    }
  })

  // return bouncer.js instance
  return bouncer
}

// export
module.exports = server
