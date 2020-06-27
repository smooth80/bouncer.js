const BouncerJs = require("../index.js");
const fs = require("fs");
const path = require("path");

const indexFile = fs.readFileSync(path.resolve(__dirname, "index.html"), {
  encoding: "utf8",
});

const { router, config, broadcast } = new BouncerJs({
  debug: true,
  plugins: { chat },
});

router.get("/*", (res, req) => {
  res.end(indexFile);
});

/**
 * @param {WebSocket} ws
 * @param {BouncerMessageObject} message
 */
function chat(ws, { id, event, data }) {
  // Broadcast to all sockets inside chat topic
  broadcast({ topic: "chat" }, { id, event, data });

  if (config.debug) {
    console.log({ id, event, data });
  }
}
