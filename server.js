'use strict'

// dependencies
const Cache = require('latermom')
const BouncerJs = require('.')
const fileReader = require('./lib/file-reader')

// return bouncer.js instance
function server(
  // first argument is directory you want to static serve
  dist = 'dist',
  // second argument is plugins object with functions - more in README.md
  plugins = {},
  // extra configuration for bouncer
  config = {}
) {
  // create bouncer.js instance
  const bouncer = new BouncerJs({ ...config, plugins })
  // init cache with fileReader on dist folder
  const cache = new Cache(fileReader(dist))

  // process all requests
  bouncer.router.get('/*', async (res, req) => {
    const url = req.getUrl()
    const { mime, body, filename } = cache.get(url)

    console.log(200, 'GET', mime, filename)

    res.writeHeader('Content-Type', mime)
    res.end(body)
  })

  // return bouncer.js instance
  return bouncer
}

// export
module.exports = server
