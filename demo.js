'use strict';

// require static files server
const serve = require('./server.js')
// require chat plugin
const { chat } = require('./echo.js')

// serve demo folder with chat plugin
serve('demo', { chat })
