# Bouncer🚀

A simple multiple room manager for socket.io on express.

## General use case

- you're only able to spawn one process and you'd like to have an `express` app with whatever framework,
- at the same time spawn X number of scalable microservices that use `node` and can connect `socket.io` (websockets).

## Common use case

- Single process app server like a free `heroku.com` account or similar
- Building a chat
- Making node + javascript games

## Installation

It's hosted as an `npm` package so installation is of course as simple as:

```bash
yarn add bouncer.js --save
```

## The application:

Node.js part:

```javascript
// context (this) = bouncer instance
const plugins = [
  function chat(socket, handshake) {
    // Extend socket
    socket.name = Math.random().toString(36).replace(".", "");

    // Bind events
    socket.on("sent", (data) => speak(this, socket.name, "sent", data));
    socket.on("disconnect", (data) => speak(this, socket.name, "left", data));
    socket.emit("messages", { messages, handshake });

    // Notify others
    speak(this, socket.name, "joined", handshake);
  },
];

const app = express();
const bouncer = new Bouncer(plugins).createServer(app).connect();
```

Frontend part:

```javascript
const io = require("socket.io-client");
const socket = io();

socket.on("connect", function () {
  socket.emit("handshake:chat");
});
```

## Full Application (Chat) Example:

To run below example you can run:

```bash
yarn test
```

## Configuration

see [config.js](https://github.com/Prozi/bouncer.js/blob/master/config.js)

---

To see complimentary RAW frontend of above chat (`index.html` - working)

see [index.html](https://github.com/Prozi/bouncer.js/blob/master/index.html)

---

## License

MIT

- Do what you want, fork, etc.
- I am not responsible for any problem this free application causes :P

have fun, please open any issues, etc.

- Jacek Pietal
