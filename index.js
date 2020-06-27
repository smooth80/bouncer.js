"use strict";

const uWebSockets = require("uws.js");
const baseConfig = require("./config.js");
const api = require("./api.js");

/**
 * @desc this is the default export
 * @param {BouncerConfig} userConfig
 * @returns {BouncerCallResult}
 */
class BouncerJs {
  constructor(userConfig = {}) {
    const rooms = new Map();
    const config = { ...baseConfig, ...userConfig };
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
         * @desc this is Leave room and broadcast leave event
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
         * @desc this is Join + run plugins + leave
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

    this.join = join;
    this.leave = leave;
    this.broadcast = broadcast;
    this.send = send;

    this.router = bouncer;
    this.rooms = rooms;
    this.config = config;
  }
}

module.exports = BouncerJs;
