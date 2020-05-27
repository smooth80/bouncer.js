module.exports.LOGO = "bouncer🚀";

module.exports.port = process.env.PORT || 1337;

module.exports.join = "/join";

module.exports.leave = "/leave";

module.exports.onMessage = onMessageFallback;

module.exports.createSocketId = createSocketIdFallback;

/**
 * @param {WebSocket} ws
 * @param {any} message
 * @param {boolean} isBinary
 */
function onMessageFallback(ws, message) {
  ws.send(JSON.stringify(message));
}

function createSocketIdFallback() {
  return Math.random().toString(16).replace(".", "");
}
