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
  plugins = {}
) {
  // create bouncer.js instance
  const bouncer = new BouncerJs({ plugins })
  // init cache with fileReader on dist folder
  const cache = new Cache(fileReader(dist))

  // process all requests
  bouncer.router.get('/*', async (res, req) => {
    const url = req.getUrl()
    const content = cache.get(url)

    res.end(content)
  })

  // return bouncer.js instance
  return bouncer
}

// export
module.exports = server
