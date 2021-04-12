<h2 align="center">bouncer 🐻</h2>

<p align="center">
  <a href="https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js"><img src="https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js.svg" alt="shield" /></a>
  <a href="https://www.npmjs.com/package/@jacekpietal/sync"><img src="https://img.shields.io/npm/dt/@jacekpietal/bouncer.js.svg?style=flat-square" alt="shield" /></a>
  <a href="https://circleci.com/gh/Prozi/bouncer.js"><img src="https://circleci.com/gh/Prozi/bouncer.js.svg?style=shield" alt="shield" /></a>
</p>

<p align="center">
  A `bouncer` is a guy who works outside the night club checking did you pay for the entrance to that particular club.
  This library is a plug-and-play static files server + uWebSockets plugin manager with chat example and angular integration. One client (socket) may be subscribed to many topics (rooms) at the same time (since v2.18.0).
</p>

<br/>

## Common use cases when you might want to use this library:

- you want a static files server
- you want to build a websocket chat
- you want to build any websocket plugin
- you want it on a single process
- you want easy angular integration
- you want easy vanilla js integration

----

<!-- TOC -->

1. [Common use cases when you might want to use this library:](#common-use-cases-when-you-might-want-to-use-this-library)
1. [Installation](#installation)
1. [Usage](#usage)
    - [Backend: Cli Usage](#backend-cli-usage)
    - [Backend: API Usage](#backend-api-usage)
    - [Frontend: Angular ChatService](#frontend-angular-chatservice)
    - [Frontend: Vanilla JS](#frontend-vanilla-js)
1. [The Flow (!)](#the-flow-)
1. [The Plugins (!)](#the-plugins-)
1. [Configuration](#configuration)
    - [BouncerJS API](#bouncerjs-api)
1. [Front End Client (socket.io-ish) extension](#front-end-client-socketio-ish-extension)
1. [Example imports](#example-imports)
1. [Tests](#tests)
1. [Compatibility](#compatibility)
    - [What does that shim do?](#what-does-that-shim-do)
1. [License](#license)
    - [MIT](#mit)
1. [Author](#author)

<!-- /TOC -->

----

## Installation

It's hosted as an `npm` package so installation is of course as simple as:

```bash
$ yarn add @jacekpietal/bouncer.js

# or

$ npm i @jacekpietal/bouncer.js --save
```

## Usage

### Backend: Cli Usage

to start static server of folder `dist/your-app` with `chat` plugin and default options run:

```bash
$ yarn bouncer.js dist/your-app
```

port defaults to `4200` if `process.env.PORT` not set

### Backend: API Usage

serve folder with plugin (chat)

port defaults to `4200` if `process.env.PORT` not set

```javascript
// require static files server
const serve = require('@jacekpietal/bouncer.js/server')
// require chat plugin
const chat = require('@jacekpietal/bouncer.js/plugins/chat')

// serve public folder with chat plugin debug and ssl
serve(
  'dist/your-app',
  { chat },
  { // optional
    debug: true, // optional
    ssl: { // optional
      key_file_name,
      cert_file_name,
      passphrase // optional
    }
  }
)
```

### Frontend: Angular ChatService

frontend for above backend

```javascript
// app.module.ts

+ import { ChatService } from '@jacekpietal/bouncer.js/build/plugins/chat/ng/chat.service';

+ function chatFactory(window: Window) {
+   return new ChatService(window);
+ }

+ { provide: 'Window', useValue: window },
+ { provide: 'Chat', useFactory: chatFactory, deps: ['Window'] }
```

```javascript
// your-component.ts

+ constructor(@Inject('Chat') chat: ChatService) {
+   chat.connect() // if argument address not specified connects to location.origin
+ }
```

```bash
# add minimal typings

$ mkdir -p src/types
$ cp node_modules/@jacekpietal/bouncer.js/bouncer-js.d.ts src/types
```

### Frontend: Vanilla JS

```javascript
// concect to server at port 4200
const socket = new WebSocket('ws://localhost:4200')
let username,
  messages = [],
  message = ''

// on socket available to send
socket.onopen = (value) => {
  // mandatory in this library
  socket.send(JSON.stringify({ event: '/join', data: 'chat' }))
}

// on receive message from server
socket.onmessage = ({ data: string }) => {
  const { id, event, data } = JSON.parse(string)

  // first message is always join message
  if (!username) {
    // set own user id
    username = id
  }

  // append to list of messages
  messages.push(`<div>${id} &gt; ${event} &gt; ${data}</div>\n`)
}

// on demo form submit send message to server
function sendMessage(event) {
  // dont send form anywhere :)
  event.preventDefault()

  const data = message.trim()

  // dont send void data
  if (!data) return

  // after we get data value, empty chatbox
  message = ''

  // send message to socket
  socket.send(JSON.stringify({ event: 'say', data }))
}
```

## The Flow (!)

STEP 1: Before Connection

- client -> connects websocket to bouncer server on ws:// or wss:// protocol
- server -> waits for handshake / join event (which is defined in config.join)

STEP 2: Connection

- client -> sends handshake / join event with topic aka room name aka plugin name
- server -> plugin associated with that room joins client to room and starts to listen
- server -> broadcasts to all the people of that room that mentioned client joined

STEP 3: After Connection

- client -> does some actions (emits, receives)
- server -> plugin responds to the actions

STEP 4: Finish Connection

- client -> disconnects after some time
- server -> broadcasts to all other people from the room that client left (config.leave)

## The Plugins (!)

- To handshake a plugin in bouncer you need to send from your connected client something with similar payload:

```javascript
{ "event": "/join", "data": "pluginName" }
```

- A plugin is a function (ws, { id, event, data }) that is called each time the frontend websocket emits something to the server. context (this) of each plugin is bouncer instance.

- The plugins receive (and send) the data in the format of:

```javascript
{
  id,    // WebSocket id - this is automatically added
  event, // event name as string
  data,  // any data accompanying the event
}
```

- Read more (with types and parameters) in the [API Documentation](https://prozi.github.io/bouncer.js/api/)

## Configuration

A call to `new BouncerJs(userConfig)` creates a bouncer instance

It is ready to receive any number of the following props if any as constructor parameters:

```javascript
{
  plugins: {
    // any number of plugins with this format
    [plugin]: function (ws, { event, id, data }) {
      // user implementation
      // `this` context is bound to the bouncer instance
    }
  },
  // logo for discriminating lib's messages
  LOGO: '~>',
  // default port is read from ENV
  port: process.env.PORT | 4200,
  // this event joins a topic / room
  join: '/join',
  // this event leaves a topic / room
  leave: '/leave',
  // a lot more logs
  debug: false,
  // for creating random unique socket id
  idConfig: { lang: "english"|"japanese", len: 5 },
  // defaults to undefined
  ssl: {
    key: '/path/to/key_file_name.key',
    cert: '/path/to/cert_file_name.crt',
    passphrase: ''
  }
}
```

### BouncerJS API

```javascript
{
  onEvent(ws, event, data),
  join(ws, topic),
  leave(ws, topic),
  broadcast({ topic }, { id, event, data }),
  send(ws, { id, event, data }),
  router: uws.SSLApp|uws.App,
  rooms: Map(),
  config: {
    // read above section in readme, also:
    // after the client config is applied to default config
    // the resulting startup config reference is here
  }
}
```

## Front End Client (socket.io-ish) extension

If you can use a bundler for frontend, see:

- see [client.js](https://github.com/Prozi/bouncer.js/blob/master/client.js)
- see [client.spec.js](https://github.com/Prozi/bouncer.js/blob/master/client.spec.js)

to improve above frontend code yourself with it

```javascript
// uWebSocket api is extended in @jacekpietal/bouncer.js/client by
{
  emitEvent(eventName, objectOrString),
  emit(objectOrString),
  on(eventName, callback),
  on('*', callback), // on any event
}
```

## Example imports

```javascript
// require static files server
const serve = require('@jacekpietal/bouncer.js/server')
```

```javascript
// for frontend use this is a websocket enchanced,
// but you can still use normal websocket on frontend
const UWebSocketClient = require('@jacekpietal/bouncer.js/client')
```

```javascript
// chat plugin ready to be used with bouncer
// chat === createEcho("chat");
const chat = require('@jacekpietal/bouncer.js/plugins/chat')
```

```javascript
const createEcho = require('@jacekpietal/bouncer.js/lib/echo')
// this creates a simple plugin with echo broadcast back to others
// with topic named joystick
const joystick = createEcho('joystick')
```

```javascript
// the heart of the library
const BouncerJs = require('@jacekpietal/bouncer.js')
```

```javascript
// allows to use older plugins with 2 functions
// deprecated, backwards compatibility to older versions
const shim = require('@jacekpietal/bouncer.js/lib/shim')
```

## Tests

| Test Suites: | 5 passed, 5 total   |
| ------------ | ------------------- |
| Tests:       | 16 passed, 16 total |
| Snapshots:   | 0 total             |
| Time:        | 1.303 s             |

<br/>

```bash
# to test run:

$ yarn test # 
matic tests in jest
$ yarn start # manual test/example: chat
```

## Compatibility

For the few users to have somewhat of a bridge between the [socket-starter](https://github.com/Prozi/socket-starter) library that this library deprecates:

- see [shim.js](https://github.com/Prozi/bouncer.js/blob/master/lib/shim.js)
- see [shim.spec.js](https://github.com/Prozi/bouncer.js/blob/master/lib/shim.spec.js)

### What does that shim do?

If you do `shim(plugin)` then your plugin may be in the format of:

```javascript
{
  initialize(io)
  handshake(socket, data),
}
```

## License

[LICENSE](https://github.com/Prozi/bouncer.js/blob/master/LICENSE)

### MIT

- Do what you want, fork, etc.
- I am not responsible for any problem this free application causes :P
- Have fun, please open any issues, etc.

## Author

- &copy; 2020-2021 Jacek Pietal
