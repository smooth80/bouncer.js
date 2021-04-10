'use strict'

// require static files server
const serve = require('../server')
// require chat plugin
const chat = require('../plugins/chat')

// serve demo folder with chat plugin
serve('demo', { chat })
