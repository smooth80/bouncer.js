module.exports.LOGO = "bouncer🚀";

module.exports.port = process.env.PORT || 1337;

module.exports.join = "/join";

module.exports.leave = "/leave";

module.exports.onMessage = echo;

module.exports.createSocketId = simpleId;

module.exports.plugins = {};

/**
 * @param {WebSocket} ws
 * @param {object} message
 */
function echo(ws, message) {
  try {
    ws.send(JSON.stringify(message));
  } catch (err) {
    console.warn(err);
  }
}

function simpleId() {
  return Math.random().toString(16).replace(".", "");
}
