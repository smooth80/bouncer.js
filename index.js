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
    this.rooms = new Map();
    this.config = { ...baseConfig, ...userConfig };

    const ssl = this.config.ssl || {};

    if (this.config.debug) {
      console.log("Start with this.config", this.config);
    }

    const { join, leave, broadcast, send, run } = api(this);
    const start = this.config.ssl ? uWebSockets.SSLApp : uWebSockets.App;

    this.router = start({
      key_file_name: ssl.key,
      cert_file_name: ssl.cert,
    });

    this.router
      .ws("/*", {
        /**
         * @desc this is Leave room and broadcast leave event
         * @param {WebSocket} ws
         */
        close: (ws) => {
          try {
            const { id, topic } = ws;

            leave(ws);

            broadcast({ topic }, { id, event: this.config.leave, data: topic });
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
            if (event === this.config.join) {
              join(ws, data);
            }

            run(ws, event, data);

            // Optional leave: removes ws.topic
            if (event === this.config.leave) {
              leave(ws);
            }
          } catch (err) {
            console.error(err.stack || err);
          }
        },
      })
      /**
       * @param {number} port
       */
      .listen(this.config.port, (listenSocket) => {
        if (listenSocket) {
          console.log(
            `${this.config.LOGO} Listens on port ${this.config.port}`,
          );
        }
      });

    this.join = join;
    this.leave = leave;
    this.broadcast = broadcast;
    this.send = send;
  }
}

module.exports = BouncerJs;
