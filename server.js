'use strict'

// dependencies
const { readFileSync } = require('fs')
const BouncerJs = require('.')

// return bouncer.js instance
function server(
  // first argument is directory you want to static server
  dist = 'dist',
  // second argument is plugins object with functions - more in README.md
  plugins = {}
) {
  // create bouncer.js instnace
  const bouncer = new BouncerJs({ plugins })
  // get index.html file fcontent rom folder you want to serve
  const index = readFileSync(`./${dist}/index.html`, { encoding: 'utf8' })

  // process all requests
  bouncer.router.get('/*', (res, _req) => {
    // to send index content
    res.end(index)
  })

  // return bouncer.js instance
  return bouncer
}

// export
module.exports = server
