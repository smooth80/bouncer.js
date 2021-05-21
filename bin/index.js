#!/usr/bin/env node

'use strict'

const serve = require('../server')

// convert bash params to array
const params = Array.from(process.argv)

// get dist folder and options
const [_node, _bouncer, dist, ...options] = params

// get possible chat flag, conditionally require chat if required
const plugins = options.includes('--chat')
  ? { chat: require('../plugins/chat') }
  : {}

// get possible debug flag
const debug = options.includes('--debug')

// static serve dist folder with chat and maybe debug
serve(dist, plugins, { debug })
