<h2 align="center">bouncer 🐻</h2>

<p align="center">
  <a href="https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js"><img src="https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js.svg" alt="shield" /></a>
  <a href="https://www.npmjs.com/package/@jacekpietal/sync"><img src="https://img.shields.io/npm/dt/@jacekpietal/bouncer.js.svg?style=flat-square" alt="shield" /></a>
  <a href="https://circleci.com/gh/Prozi/bouncer.js"><img src="https://circleci.com/gh/Prozi/bouncer.js.svg?style=shield" alt="shield" /></a>
</p>

<p align="center">
  A `bouncer` is a guy who works outside the night club checking did you pay for the entrance to that particular club. This is a simple but extendable multiple room manager for uWebSockets aka micro web sockets.
</p>

<br/><br/>

### Common use cases when you might need the bouncer.js:

- You're only able to spawn one process and you'd like to have an app with rooms.
- At the same time spawn X number of scalable microservices that can connect as websockets.
- Single process app server like a free `heroku.com` account or similar
- Building a chat
- Making node + javascript games

## 1. The Flow (!)

- client -> connects websocket to bouncer server on ws:// or wss:// protocol
- server -> waits for handshake / join event (which is defined in config.join)
- client -> sends handshake / join event with topic aka room name aka plugin name
- server -> initializes a plugin associated with that room to that client's websocket

### Call to `new BouncerJs()`

<p>
  It is ready to receive any of the following props as constructor parameters:
</p>

```javascript
{
  plugins: {
    // any number of plugins with this format
    [plugin]: (ws, { event, id, data }) => {
      // user implementation
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
  leave(ws),
  broadcast({ topic }, data),
  send(ws, message),
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

// chat plugin ready to be used with bouncer
const chat = require("@jacekpietal/bouncer.js/chat.js");

// for frontend use this is a websocket enchanced,
// but you can still use normal websocket on frontend
const UWebSocketClient = require("@jacekpietal/bouncer.js/client.js");

// allows to use older plugins with 2 functions
// deprecated, backwards compatibility to older versions
const shim = require("@jacekpietal/bouncer.js/shim.js");
```

## 2. The plugins

- A plugin is a function (ws, { id, event, data }) that is called each time the frontend websocket emits something to the server. context (this) of each plugin is bouncer instance.

- The plugins receive (and send) the data in the format of:

```
{
  id,    // WebSocket id
  event, // event name as string
  data,  // any data accompanying the event
}
```

- Read more (with types and parameters) in the [API Documentation](https://prozi.github.io/bouncer.js/api/)

---

## 3. Installation

It's hosted as an `npm` package so installation is of course as simple as:

```bash
npm i @jacekpietal/bouncer.js --registry https://registry.yarnpkg.com

# or yarn add @jacekpietal/bouncer.js --save
```

---

## 4. Chat [full working app] example:

### 4.1 Node.js part:

```javascript
const fs = require("fs");
const path = require("path");
const BouncerJs = require("@jacekpietal/bouncer.js");
const chat = require("@jacekpietal/bouncer.js/chat");

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

### 4.2. Frontend part:

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

  const { value: data } = refs.message;
  refs.message.value = "";
  socket.send(JSON.stringify({ event: "say", data }));
});
```

### 4.3. To run above example you can run:

```bash
yarn test:chat
```

And visit `http://localhost:8080` in your favourite Chrome browser or other.

---

## 6. Backwards compatibility

For the few users to have somewhat of a bridge between the [socket-starter](https://github.com/Prozi/socket-starter) library that this library deprecates:

- see [shim.js](https://github.com/Prozi/bouncer.js/blob/master/shim.js)
- see [shim.spec.js](https://github.com/Prozi/bouncer.js/blob/master/shim.spec.js)

### 6.1. What does this do?

if you do `shim(plugin)` then your plugin may be in the format of:

```javascript
{
  initialize(io)
  handshake(socket, data),
}
```

shim adds to your plugin

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

- `yarn test` (automatic)
- `yarn test:chat` (manual)
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

have fun, please open any issues, etc.

## 10. Author

- Jacek Pietal
