const bouncerJs = require(".");

const { config, broadcast } = bouncerJs({
  debug: true,
  plugins: { chat },
});

/**
 * @param {WebSocket} ws
 * @param {Object} message
 */
function chat(ws, { id, event, data }) {
  switch (event) {
    case config.join:
    case config.leave:
    case "say":
      // Broadcast to all sockets inside chat topic
      broadcast({ topic: "chat" }, { id, event, data });

      if (config.debug) {
        console.log({ id, event, data });
      }
      break;
  }
}
