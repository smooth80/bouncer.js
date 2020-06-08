# bouncer 🤵

[![npm version](https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js.svg)](https://badge.fury.io/js/%40jacekpietal%2Fbouncer.js)

[![CircleCI](https://circleci.com/gh/Prozi/bouncer.js.svg?style=svg)](https://circleci.com/gh/Prozi/bouncer.js)

A simple multiple room manager for micro-WebSockets.

## General use case

- You're only able to spawn one process and you'd like to have an app with rooms.
- At the same time spawn X number of scalable microservices that can connect as websockets.

## Common use case

- Single process app server like a free `heroku.com` account or similar
- Building a chat
- Making node + javascript games

## Installation

It's hosted as an `npm` package so installation is of course as simple as:

```bash
yarn add @jacekpietal/bouncer.js --save
```

---

## Chat [full working app] example:

### Node.js part:

```javascript
const bouncerJs = require("@jacekpietal/bouncer.js");

const { broadcast } = bouncerJs({
  debug: true,
  plugins: { chat },
});

/**
 * @param {WebSocket} ws
 * @param {object} message
 */
function chat(ws, { id, event, data }) {
  switch (event) {
    case "say":
      // broadcast to all sockets inside chat topic
      broadcast("chat", { id, event, data });
      break;
  }
}

// "bouncer 🤵 started"
// "bouncer 🤵 listens @ 1337"
```

### Frontend part:

```javascript
const socket = new WebSocket("ws://localhost:1337");

socket.onopen = (value) => {
  socket.send(JSON.stringify({ event: "/join", data: "chat" }));
};

socket.onmessage = ({ data: string }) => {
  const { id, event, data } = JSON.parse(string);

  console.log({ id, event, data });
};
```

### To run above example you can run:

```bash
yarn test:chat
```

And visit `http://localhost:8080` in your favourite Chrome browser or other.

## Configuration

Configuration is default, being extended with provided by user.

see [config.js](https://github.com/Prozi/bouncer.js/blob/master/config.js)

---

To see complimentary RAW frontend of above chat:

see [index.html](https://github.com/Prozi/bouncer.js/blob/master/index.html)

---

## Backwards compatibility

For the few users to have somewhat of a bridge between the [socket-starter](https://github.com/Prozi/socket-starter) library that this library deprecates:

see [socket-starter.shim.js](https://github.com/Prozi/bouncer.js/blob/master/socket-starter.shim.js)

---

## Tests

| Name         | Count               |
| ------------ | ------------------- |
| Test Suites: | 2 passed, 2 total   |
| Tests:       | 10 passed, 10 total |
| Snapshots:   | 0 total             |
| Time:        | 1.005 s             |

to test run `yarn test` (automatic) or `yarn test:chat` (manual)

---

## License

MIT

- Do what you want, fork, etc.
- I am not responsible for any problem this free application causes :P

have fun, please open any issues, etc.

- Jacek Pietal
