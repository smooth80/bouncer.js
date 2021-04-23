#!/usr/bin/env node

'use strict'

const serve = require('../server')
const chat = require('../plugins/chat')

// convert bash params to array
const params = Array.from(process.argv)

// get dist folder and options
const [_node, _bouncer, dist, ...options] = params

// get possible debug flag
const debug = options.includes('--debug')

// static serve dist folder with chat and maybe debug
serve(dist, { chat }, { debug })
