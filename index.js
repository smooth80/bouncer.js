const uWebSockets = require("uwebsockets.js");
const baseConfig = require("./config.js");
const api = require("./api.js");

/**
 * @typedef {Object} BouncerConfig
 * @property {string} LOGO :)
 * @property {number} port 1337
 * @property {string} join /join
 * @property {string} leave /leave
 * @property {function} createSocketId () => string
 * @property {Object} plugins { function chat() {} }
 */

/**
 * @typedef {Object} BouncerAPI
 * @property {function} join (ws, topic)
 * @property {function} leave (ws)
 * @property {function} broadcast ({ topic }, { id, event, data })
 * @property {function} send (ws, { id, event, data })
 * @property {uWebSockets.SSLApp|uWebSockets.App} bouncer
 * @property {Map} rooms
 * @property {Object} config
 */

/**
 * @param {BouncerConfig} userConfig
 * @returns {BouncerAPI}
 */
const bouncerJs = (userConfig = {}) => {
  const rooms = new Map();
  const config = Object.assign(baseConfig, userConfig);
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
       * @description Leave room and broadcast leave event
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
       * @description Join + run plugins + leave
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
    /**
     * @param {number} config.port
     */
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
    // Reference to bouncer Object
    bouncer,
    // Reference to rooms Map
    rooms,
    // Reference to resulting config JSON
    config,
  };
};

module.exports = bouncerJs;
