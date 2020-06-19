<h2 align="center">bouncer 🤵</h2>

<p align="center">
  <a href="https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js"><img src="https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js.svg" alt="shield" /></a>
  <a href="https://circleci.com/gh/Prozi/bouncer.js"><img src="https://circleci.com/gh/Prozi/bouncer.js.svg?style=shield" alt="shield" /></a>
</p>

<p align="center">
  A simple multiple room manager for micro-WebSockets.
</p>

## 1. General use case

- You're only able to spawn one process and you'd like to have an app with rooms.
- At the same time spawn X number of scalable microservices that can connect as websockets.

## 1.1 Common use case

- Single process app server like a free `heroku.com` account or similar
- Building a chat
- Making node + javascript games

## 2. Installation

It's hosted as an `npm` package so installation is of course as simple as:

```bash
yarn add @jacekpietal/bouncer.js --save
```

---

## 3. API:

Call to `bouncerJs()`

1. Expects the following Object as argument:

```javascript
{
  ...config,
  plugins,
}
```

2. Returns following API:

```javascript
{
  // Helper functions
  join,
  leave,
  broadcast,
  send,
  // Reference to uWebSockets[SSLApp|App]
  router,
  // Reference to rooms Map
  rooms,
  // Reference to resulting config JSON
  config,
}
```

### 3.1 Read more (with types and parameters)

In [The API Documentation](https://prozi.github.io/bouncer.js/api/)

---

## 4. Chat [full working app] example:

### 4.1 Node.js part:

```javascript
const bouncerJs = require("../index.js");
const fs = require("fs");
const path = require("path");

const indexFile = fs.readFileSync(path.resolve(__dirname, "index.html"), {
  encoding: "utf8",
});

const { router, config, broadcast } = bouncerJs({
  debug: true,
  plugins: { chat },
});

router.get("/*", (res, req) => {
  res.end(indexFile);
});

/**
 * @param {WebSocket} ws
 * @param {Object} message
 */
function chat(ws, { id, event, data }) {
  // Broadcast to all sockets inside chat topic
  broadcast({ topic: "chat" }, { id, event, data });

  if (config.debug) {
    console.log({ id, event, data });
  }
}
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

## 5. Configuration

Configuration is default, being extended with provided by user.

see [config.js](https://github.com/Prozi/bouncer.js/blob/master/config.js)

---

To see complimentary RAW frontend of above chat:

see [index.html](https://github.com/Prozi/bouncer.js/blob/master/index.html)

---

## 6. Backwards compatibility

For the few users to have somewhat of a bridge between the [socket-starter](https://github.com/Prozi/socket-starter) library that this library deprecates:

- see [socket-starter.shim.js](https://github.com/Prozi/bouncer.js/blob/master/socket-starter.shim.js)
- see [socket-starter.shim.spec.js](https://github.com/Prozi/bouncer.js/blob/master/socket-starter.shim.spec.js)

---

## 7. Tests

| Name         | Count               |
| ------------ | ------------------- |
| Test Suites: | 2 passed, 2 total   |
| Tests:       | 12 passed, 12 total |
| Snapshots:   | 0 total             |
| Time:        | 1.009 s             |

To test run:

- `yarn test` (automatic)
- `yarn test:chat` (manual)

---

## 7. License

MIT

- Do what you want, fork, etc.
- I am not responsible for any problem this free application causes :P

have fun, please open any issues, etc.

- Jacek Pietal
