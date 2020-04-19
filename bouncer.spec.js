const express = require("express");
const Bouncer = require("./bouncer");

let messages = [];

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

if (!bouncer) {
  process.exit(1);
}

function speak(bouncer, name, action, data) {
  messages.push({ name, action, data });

  bouncer.io.emit(action, { name, data });
  bouncer.speak(`${name} ${action} ${JSON.stringify(data)}`);
}
