const uWebSockets = require("uwebsockets.js");
const defaultConfig = require("./config.js");
const api = require("./api.js");

/**
 * @param {[key: string]: any} configuration
 * @returns {uWebSockets.SSLApp | uWebSockets.App}
 */
const bouncerJs = (configuration = {}) => {
  const rooms = new Map();
  const config = Object.assign(defaultConfig, configuration);
  const ssl = config.ssl || {};

  // bind utils context (this) to bouncer instance
  const { join, leave, broadcast, send, run } = api(rooms, config);

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
        try {
          const { id, topic } = ws;

          leave(ws);

          broadcast({ topic }, { id, event: config.leave, data: topic });
        } catch (err) {
          console.error(err.stack || err);
        }
      },
      /**
       * @param {WebSocket} ws
       * @param {ArrayBuffer} message
       */
      message: (ws, message) => {
        try {
          const utf8 = Buffer.from(message).toString();
          const { event, data } = JSON.parse(utf8);

          // Optional join: sets ws.topic
          if (event === config.join) {
            join(ws, data);
          }

          run(ws, event, data);

          // Optional leave: removes ws.topic
          if (event === config.leave) {
            leave(ws);
          }
        } catch (err) {
          console.error(err.stack || err);
        }
      },
    })
    .listen(config.port, (listenSocket) => {
      if (listenSocket) {
        console.log(`${config.LOGO} Listens on port ${config.port}`);
      }
    });

  return {
    // Helper functions
    join,
    leave,
    broadcast,
    send,
    // Reference to bouncer object
    bouncer,
    // Reference to rooms Map
    rooms,
    // Reference to resulting config JSON
    config,
  };
};

module.exports = bouncerJs;
