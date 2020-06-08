const bouncerJs = require(".");

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
