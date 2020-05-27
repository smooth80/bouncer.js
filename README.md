# Bouncer🚀

A simple multiple room manager for micro-WebSockets.

## General use case

- You're only able to spawn one process and you'd like to have an app with rooms.
- At the same time spawn X number of scalable microservices that can connect as websockets\*.

\*) To do so, override default config.onMessage

## Common use case

- Single process app server like a free `heroku.com` account or similar
- Building a chat
- Making node + javascript games

## Installation

It's hosted as an `npm` package so installation is of course as simple as:

```bash
yarn add @jacekpietal/bouncer.js --save
```

## The application:

Node.js part:

```javascript
const bouncerJs = require("@jacekpietal/bouncer.js");

const bouncer = bouncerJs();
// "bouncer🚀 started"
// "bouncer🚀 listens @ 1337"
```

Frontend part:

```javascript
const socket = new WebSocket("ws://localhost:1337");

socket.onopen = (value) => {
  socket.send(JSON.stringify({ event: "/join", data: "chat" }));
};

socket.onmessage = ({ data: string }) => {
  const { author, event, data } = JSON.parse(string);
  console.log({ author, event, data });
};
```

## Full Application (Chat) Example:

To run below example you can run:

```bash
yarn test:chat
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
