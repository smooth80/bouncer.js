<h2 align="center">bouncer 🐻</h2>

<p align="center">
  <a href="https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js"><img src="https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js.svg" alt="shield" /></a>
  <a href="https://www.npmjs.com/package/@jacekpietal/sync"><img src="https://img.shields.io/npm/dt/@jacekpietal/bouncer.js.svg?style=flat-square" alt="shield" /></a>
  <a href="https://circleci.com/gh/Prozi/bouncer.js"><img src="https://circleci.com/gh/Prozi/bouncer.js.svg?style=shield" alt="shield" /></a>
</p>

<p align="center">
  A `bouncer` is a guy who works outside the night club checking did you pay for the entrance to that particular club. This is a simple but extendable multiple room manager for uWebSockets aka micro web sockets. One person (socket) may be in many clubs (topics) at the same time (from v2.18.0).
</p>

<br/><br/>

### Common use cases when you might need the bouncer.js:

- You're only able to spawn one process and you'd like to have an app with rooms.
- At the same time spawn X number of scalable microservices that can connect as websockets.
- Single process app server like a free `heroku.com` account or similar
- Building a chat
- Making node + javascript games

---

## 1. Installation

It's hosted as an `npm` package so installation is of course as simple as:

```bash
$ yarn add @jacekpietal/bouncer.js --save
# or
$ npm i @jacekpietal/bouncer.js --save
```

---

## 2. Example: Chat - Node.js part:

```javascript
// require static files server
const serve = require('@jacekpietal/bouncer.js/server.js')
// require chat plugin
const { chat } = require('@jacekpietal/bouncer.js/echo.js')

// serve demo folder with chat plugin
serve('demo', { chat })
```

## 3. Example: Chat - Frontend part:

```javascript
// conect
const socket = new WebSocket('ws://localhost:1337')

// convert above/below html ids list to html object references
const ids = ['username', 'messages', 'message', 'chat']
const refs = ids.reduce(
  (obj, id) => ({
    ...obj,
    [id]: document.querySelector(`#${id}`)
  }),
  {}
)

// on socket available to send
socket.onopen = (value) => {
  // mandatory in this library
  socket.send(JSON.stringify({ event: '/join', data: 'chat' }))
}

// on receive message from server
socket.onmessage = ({ data: string }) => {
  const { id, event, data } = JSON.parse(string)

  // first message is always join message
  if (!refs.username.innerText) {
    // set own user id
    refs.username.innerText = id
  }

  // append to list of messages
  refs.messages.innerHTML += `<div>${id} &gt; ${event} &gt; ${data}</div>\n`
}

// on demo form submit send message to server
refs.chat.addEventListener('submit', (event) => {
  // dont send form anywhere :)
  event.preventDefault()

  const data = refs.message.value.trim()

  // dont send void data
  if (!data) return

  // after we get data value, empty chatbox
  refs.message.value = ''

  // send message to socket
  socket.send(JSON.stringify({ event: 'say', data }))
})
```

\*) frontend part can be improved using `@jacekpietal/bouncer.js/client.js`

## 4. What happened? - The Flow (!)

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

## 5. Configuration

### A call to `new BouncerJs(userConfig)` creates a bouncer instance

<p>
  It is ready to receive any number of the following props if any as constructor parameters:
</p>

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
  LOGO: 'bouncer 🐻',
  // default port is read from ENV
  port: process.env.PORT | 1337,
  // this event joins a topic / room
  join: '/join',
  // this event leaves a topic / room
  leave: '/leave',
  // a lot more logs
  debug: false,
  // for creating random unique socket id
  idConfig: { lang: "english"|"japanese", len: 5 }
}
```

### Instance of bouncer has the following API exposed:

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

### Example includes from this library:

```javascript
// the heart of the library
const BouncerJs = require('@jacekpietal/bouncer.js')
```

```javascript
const { createEcho } = require('@jacekpietal/bouncer.js/echo.js')
// this creates a simple plugin with echo broadcast back to others
// with topic named joystick
const plugin = createEcho('joystick')
```

```javascript
// chat plugin ready to be used with bouncer
// chat === createEcho("chat");
const { chat } = require('@jacekpietal/bouncer.js/echo.js')
```

```javascript
// for frontend use this is a websocket enchanced,
// but you can still use normal websocket on frontend
const UWebSocketClient = require('@jacekpietal/bouncer.js/client.js')
```

```javascript
// require static files server
const serve = require('@jacekpietal/bouncer.js/server.js')
```

```javascript
// allows to use older plugins with 2 functions
// deprecated, backwards compatibility to older versions
const shim = require('@jacekpietal/bouncer.js/shim.js')
```

### The Plugins (!)

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

---

### To run above example you can run:

```bash
$ cd node_modules/@jacekpietal/bouncer.js
$ yarn # install deps
$ yarn demo # start demo
```

And visit `http://localhost:1337` in your favourite Chrome browser or other.

---

## 6. Backwards compatibility

For the few users to have somewhat of a bridge between the [socket-starter](https://github.com/Prozi/socket-starter) library that this library deprecates:

- see [shim.js](https://github.com/Prozi/bouncer.js/blob/master/shim.js)
- see [shim.spec.js](https://github.com/Prozi/bouncer.js/blob/master/shim.spec.js)

### What does this shim do?

If you do `shim(plugin)` then your plugin may be in the format of:

```javascript
{
  initialize(io)
  handshake(socket, data),
}
```

---

## 7. Tests

| Name         | Count               |
| ------------ | ------------------- |
| Test Suites: | 3 passed, 3 total   |
| Tests:       | 14 passed, 14 total |
| Snapshots:   | 0 total             |
| Time:        | 1.009 s             |

<br/>

```bash
To test run:

- `yarn test` (automatic tests in jest)
- `yarn start` (manual test: chat)
```

---

## 8. Front End Client (socket.io -ish)

- see [client.js](https://github.com/Prozi/bouncer.js/blob/master/client.js)
- see [client.spec.js](https://github.com/Prozi/bouncer.js/blob/master/client.spec.js)

Standard frontend WebSocket extended with:

```javascript
{
  emit(objectOrString)
  on(eventName, callback)
  on('*', callback) // on any event
}
```

---

## 9. License

MIT

- Do what you want, fork, etc.
- I am not responsible for any problem this free application causes :P
- Have fun, please open any issues, etc.

## 10. Author

- Jacek Pietal
