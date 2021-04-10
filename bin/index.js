#!/usr/bin/env node

'use strict'

const chat = require('../plugins/chat')

const args = Array.from(process.argv)
const dist = args.length > 2 ? args.pop() : 'dist'

require('../server')(dist, { chat })
