<h2 align="center">bouncer 🐻</h2>

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
npm i @jacekpietal/bouncer.js --registry https://registry.yarnpkg.com

# or yarn add @jacekpietal/bouncer.js --save
```

---

## 3. API:

Call to `new BouncerJs()`

1. Expects the following Object as argument:

```javascript
{
  plugins: {
    [plugin]: (ws, { event, id, data }) => {
      // user implementation
    }
  },
  LOGO: 'bouncer 🐻',
  port: process.env.PORT,
  join: '/join',
  leave: '/leave',
  createSocketId: () => simpleId,
  debug: false,
}
```

2. The plugins receive (and send) the data in the format of:

```
{
  id,    // WebSocket id
  event, // event name as string
  data,  // any data accompanying the event
}
```

3. Each plugin is a function handling the topic of the room a.k.a. microservice name.

4. Creating instanceof BouncerJs returns following API:

```javascript
{
  onEvent(ws, event, data),
  join(ws, topic),
  leave(ws),
  broadcast({ topic }, data),
  send(ws, message),
  router: uws.SSLApp|uws.App,
  rooms: Map(),
  config: {},
}
```

### 3.1 Read more (with types and parameters)

In [The API Documentation](https://prozi.github.io/bouncer.js/api/)

---

## 4. Chat [full working app] example:

### 4.1 Node.js part:

```javascript
const BouncerJs = require("../index.js");
const fs = require("fs");
const path = require("path");
const chat = require("../chat.js");

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

To test run:

- `yarn test` (automatic)
- `yarn test:chat` (manual)

---

## 8. Front End Client (beta)

- see [client.js](https://github.com/Prozi/bouncer.js/blob/master/client.js)
- see [client.spec.js](https://github.com/Prozi/bouncer.js/blob/master/client.spec.js)

Standard frontend WebSocket extended with:

```
1. emit(objectOrString)
2. on(eventName, callback)
3. on("*", callback) // on any event
```

---

## 9. License

MIT

- Do what you want, fork, etc.
- I am not responsible for any problem this free application causes :P

have fun, please open any issues, etc.

## 10. Author

- Jacek Pietal
