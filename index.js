const uWebSockets = require("uwebsockets.js");
const defaultConfig = require("./config.js");
const api = require("./api.js");

/**
 * @param {[key: string]: any} configuration
 * @returns {uWebSockets.SSLApp | uWebSockets.App}
 */
const bouncerJs = (configuration = {}) => {
  const rooms = new Map();
  const config = Object.assign({}, defaultConfig, configuration);
  const ssl = config.ssl || {};

  // bind utils context (this) to bouncer instance
  const { join, leave, broadcast, send } = api(rooms, config);

  if (config.debug) {
    console.log("Start with config", config);
  }

  const start = config.ssl ? uWebSockets.SSLApp : uWebSockets.App;
  const bouncer = start({
    key_file_name: ssl.key,
    cert_file_name: ssl.cert,
  });

  bouncer
    .ws("/*", {
      /**
       * @param {WebSocket} ws
       */
      close: (ws) => {
        leave(ws);
      },
      /**
       * @param {WebSocket} ws
       * @param {ArrayBuffer} message
       */
      message: (ws, message) => {
        const utf8 = Buffer.from(message).toString();
        const { id: optionalId, event, data } = getJSON(utf8);
        const id = optionalId || ws.id;
        const run = config.plugins[ws.topic] || broadcast;

        if (event === config.leave) {
          leave(ws);
        }

        if (event === config.join) {
          join(ws, data);
        }

        run(ws.topic, { id, event, data });
      },
    })
    .listen(config.port, (listenSocket) => {
      if (listenSocket) {
        console.log(`${config.LOGO} Listens on port ${config.port}`);
      }
    });

  return Object.assign({
    // helper functions
    join,
    leave,
    broadcast,
    send,
    // reference to bouncer object
    bouncer,
    // reference to rooms Map
    rooms,
    // reference to resulting config JSON
    config,
  });
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
