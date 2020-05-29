const uWebSockets = require("uwebsockets.js");

const getUtils = require("./bouncer.utils.js");
const defaultConfig = require("./config.js");

/**
 * @param {[key: string]: any} configuration
 * @returns {uWebSockets.SSLApp | uWebSockets.App}
 */
const bouncerJs = (configuration = {}) => {
  const rooms = new Map();
  const config = Object.assign({}, defaultConfig, configuration);

  const utils = getUtils(rooms, config);

  const ssl = config.ssl || {};
  const start = config.ssl ? uWebSockets.SSLApp : uWebSockets.App;

  if (config.debug) {
    console.log("Start with config", config);
  }

  const bouncer = start({
    key_file_name: ssl.key,
    cert_file_name: ssl.cert,
  })
    .ws("/*", {
      /**
       * @param {WebSocket} ws
       */
      close: (ws) => {
        utils.leaveRoom(ws);
      },
      /**
       * @param {WebSocket} ws
       * @param {ArrayBuffer} message
       */
      message: (ws, message) => {
        const utf8 = Buffer.from(message).toString();
        const { event, data } = getJSON(utf8);

        if (event === config.leave) {
          utils.leaveRoom(ws);
        } else if (event === config.join) {
          utils.joinRoom(ws, data);
        } else {
          utils.broadcast(ws.topic, { id: ws.id, event, data }, bouncer);
        }
      },
    })
    .listen(config.port, (listenSocket) => {
      if (listenSocket) {
        console.log(`${config.LOGO} Listens on port ${config.port}`);
      }
    });

  return Object.assign(bouncer, { utils, rooms, config });
};

function getJSON(utf8) {
  try {
    return JSON.parse(utf8);
  } catch (err) {
    console.warn({ utf8 });

    return {};
  }
}

module.exports = bouncerJs;
