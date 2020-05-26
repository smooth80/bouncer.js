const uWebSockets = require("uWebSockets.js");

const utils = require("./bouncer.utils.js");
const defaultConfig = require("./config.js");

/**
 * @param {[key: string]: any} configuration
 */
const bouncerJs = (configuration = {}) => {
  const rooms = new Map();
  const config = Object.assign({}, defaultConfig, configuration);

  const ssl = config.ssl || {};
  const start = config.ssl ? uWebSockets.SSLApp : uWebSockets.App;

  if (config.debug) {
    console.log("Start with config", config);
  }

  const { joinRoom, leaveRoom, getRoomName, broadcast } = utils(rooms, config);

  return start({
    key_file_name: ssl.key,
    cert_file_name: ssl.cert,
  })
    .ws("/*", {
      /**
       * @param {WebSocket} ws
       */
      close: (ws) => {
        leaveRoom(ws);
      },
      /**
       * @param {WebSocket} ws
       * @param {any} message
       */
      message: (ws, message) => {
        const utf8 = Buffer.from(message).toString();
        const { join, leave } = getRoomName(utf8);

        if (leave) {
          leaveRoom(ws);
        }

        if (join) {
          joinRoom(ws, join);
        }

        if (!join && !leave) {
          broadcast(ws, utf8);
        }
      },
    })
    .listen(config.port, (listenSocket) => {
      if (listenSocket) {
        console.log(`${config.LOGO} Listens on port ${config.port}`);
      }
    });
};

module.exports = bouncerJs;
