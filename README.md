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

## 1. The Flow (!)

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

## 2. Configuration

### A call to `new BouncerJs(userConfig)` creates a bouncer instance

<p>
  It is ready to receive any number of the following props if any as constructor parameters:
</p>

```javascript
{
  plugins: {
    // any number of plugins with this format
    [plugin]: (ws, { event, id, data }) => {
      // user implementation
      // here `this` === bouncer instance
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
  idConfig: { lang: "english"|"japanese", len: 5 },
}
```

### Examples:

- `const { config, router } = new BouncerJs()`
- `const bouncer = new BouncerJs({ debug: true, plugins: { chat } })`

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
  },
}
```

### Example files that this library includes ToC:

```javascript
// the heart of the library
const BouncerJs = require("@jacekpietal/bouncer.js");

const { createEcho } = require("@jacekpietal/bouncer.js/echo.js");
// this creates a simple plugin with echo broadcast back to others
// with topic joystick
const plugin = createEcho("joystick");

// chat plugin ready to be used with bouncer
// chat === createEcho("chat");
const { chat } = require("@jacekpietal/bouncer.js/echo.js");

// for frontend use this is a websocket enchanced,
// but you can still use normal websocket on frontend
const UWebSocketClient = require("@jacekpietal/bouncer.js/client.js");

// allows to use older plugins with 2 functions
// deprecated, backwards compatibility to older versions
const shim = require("@jacekpietal/bouncer.js/shim.js");
```

### The Plugins (!)

- To handshake a plugin in bouncer you need to send from your connected client something with similar payload: `{ "event": "/join", "data": "pluginName" }`.

- A plugin is a function (ws, { id, event, data }) that is called each time the frontend websocket emits something to the server. context (this) of each plugin is bouncer instance.

- The plugins receive (and send) the data in the format of:

```
{
  id,    // WebSocket id - this is automatically added
  event, // event name as string
  data,  // any data accompanying the event
}
```

- Read more (with types and parameters) in the [API Documentation](https://prozi.github.io/bouncer.js/api/)

---

## 3. Installation

It's hosted as an `npm` package so installation is of course as simple as:

```bash
$ yarn add @jacekpietal/bouncer.js --save
# or
$ npm i @jacekpietal/bouncer.js --save
```

---

## 4. Chat - Node.js part:

```javascript
const fs = require("fs");
const path = require("path");
const BouncerJs = require("@jacekpietal/bouncer.js");
const { chat } = require("@jacekpietal/bouncer.js/echo.js");

const indexFile = fs.readFileSync(path.resolve(__dirname, "index.html"), {
  encoding: "utf8",
});

const { router } = new BouncerJs({
  debug: true,
  plugins: { chat },
});

router.get("/*", (res, req) => {
  res.end(indexFile);
});
```

## 5. Chat - Frontend part:

```javascript
const socket = new WebSocket("ws://localhost:1337");
const refs = ["username", "messages", "message", "chat"].reduce(
  (obj, id) => ({
    ...obj,
    [id]: document.querySelector(`#${id}`),
  }),
  {},
);

socket.onopen = (value) => {
  socket.send(JSON.stringify({ event: "/join", data: "chat" }));
};

socket.onmessage = ({ data: string }) => {
  const { id, event, data } = JSON.parse(string);

  if (!refs.username.innerText) {
    refs.username.innerText = id;
  }

  refs.messages.innerHTML += `<div>${id} &gt; ${event} &gt; ${data}</div>\n`;
};

refs.chat.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = refs.message.value.trim();
  if (!data) return;

  refs.message.value = "";
  socket.send(JSON.stringify({ event: "say", data }));
});
```

- Above example can be even more cleaned up by using `@jacekpietal/bouncer.js/client.js` library

### To run above example you can run:

```bash
$ cd node_modules/@jacekpietal/bouncer.js
$ yarn && yarn start
```

And visit `http://localhost:8080` in your favourite Chrome browser or other.

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

```
To test run:

- `yarn test` (automatic tests in jest)
- `yarn start` (manual test: chat)
```

---

## 8. Front End Client (beta)

- see [client.js](https://github.com/Prozi/bouncer.js/blob/master/client.js)
- see [client.spec.js](https://github.com/Prozi/bouncer.js/blob/master/client.spec.js)

Standard frontend WebSocket extended with:

```
{
  emit(objectOrString)
  on(eventName, callback)
  on("*", callback) // on any event
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
