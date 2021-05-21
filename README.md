<h2 align="center">ʕ•ᴥ•ʔ bouncer.js ʕ•ᴥ•ʔ</h2>

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

---

<!-- TOC -->

- [Common use cases when you might want to use this library:](#common-use-cases-when-you-might-want-to-use-this-library)
- [Installation](#installation)
- [Usage](#usage)
  - [Backend: Cli Usage](#backend-cli-usage)
  - [Backend: API Usage](#backend-api-usage)
  - [Frontend: Angular ChatService](#frontend-angular-chatservice)
  - [Frontend: bouncer client](#frontend-bouncer-client)
- [The Flow (!)](#the-flow-)
- [The Plugins (!)](#the-plugins-)
- [Configuration](#configuration)
  - [BouncerJS API](#bouncerjs-api)
- [Front End Client (socket.io-ish) extension](#front-end-client-socketio-ish-extension)
- [Example imports](#example-imports)
- [Tests](#tests)
- [Compatibility](#compatibility)
  - [What does that shim do?](#what-does-that-shim-do)
- [License](#license)
  - [MIT](#mit)
- [Author](#author)
<!-- /TOC -->

---

## Installation

It's hosted as an `npm` package so installation is of course as simple as:

```bash
$ yarn add @jacekpietal/bouncer.js

# or

$ npm i @jacekpietal/bouncer.js --save
```

## Usage

### Backend: Cli Usage

to start static server of folder `dist/your-app` run

```bash
$ [PORT=4200] yarn bouncer.js dist/your-app [--debug] [--chat]
```

* the `--chat` flag starts websockets chat plugin

* the `--debug` flag starts debug mode with lots of logs

* alter port by setting `PORT env var`

### Backend: API Usage

serve folder with plugin (chat)

port defaults to `4200` if `process.env.PORT` not set

```javascript
const serve = require('@jacekpietal/bouncer.js/server')
const chat = require('@jacekpietal/bouncer.js/plugins/chat')

// serve public folder with chat plugin
serve('dist/your-app', { chat })
```

alternative

```javascript
const BouncerJs = require('@jacekpietal/bouncer.js')
const chat = require('@jacekpietal/bouncer.js/plugins/chat')
const plugins = { chat }

// serve public folder with chat plugin
new BouncerJs({ plugins }).serve('dist/your-app')
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

### Frontend: bouncer client

```javascript
const UWebSocket = require("@jacekpietal/bouncer.js/client.js");
const socket = new UWebSocket('ws://localhost:4200');
const refs = getHTMLElements();

socket.onopen = (value) => {
  // step 1 ~> 2 of flow - send handshake of plugin name
  socket.emitEvent("/join", "chat");
}

socket.on("/join", ({ id, event, data }) => {
  // first join is your join, set your server named id
  if (!refs.username.innerText) {
    refs.username.innerText = id;
  }

  // append output
  refs.messages.innerHTML += `<div>${id} &gt; ${event} &gt; ${data}</div>\n`;
});

socket.on("/leave", ({ id, event, data }) => {
  // append output
  refs.messages.innerHTML += `<div>${id} &gt; ${event} &gt; ${data}</div>\n`;
});

socket.on("say", ({ id, event, data }) => {
  // append output
  refs.messages.innerHTML += `<div>${id} &gt; ${event} &gt; ${data}</div>\n`;
});

refs.chat.addEventListener('submit', (event) => {
  event.preventDefault();

  const payload = refs.message.value.trim();
  if (!payload) return;

  socket.emitEvent("say", payload);

  refs.message.value = "";
});

function getHTMLElements() {
  return ['username', 'messages', 'message', 'chat'].reduce(
    (obj, id) => ({
      ...obj,
      [id]: document.querySelector(`#${id}`)
    }),
    {}
  );
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
  logo: 'ʕ•ᴥ•ʔ bouncer.js',
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

- Test Suites: 5 passed, 5 total
- Tests:       17 passed, 17 total

[https://circleci.com/gh/Prozi/bouncer.js](https://circleci.com/gh/Prozi/bouncer.js)

<br/>

```bash
# to test run:

$ yarn test # automatic tests in jest
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
