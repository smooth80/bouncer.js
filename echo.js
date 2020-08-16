"use strict";

function createEcho(topic) {
  /**
   * @param {WebSocket} ws
   * @param {BouncerMessageObject} message
   */
  return function echo(ws, { id, event, data }) {
    if (this.config.debug) {
      console.log({ id, event, data });
    }

    // those two cases are internally broadcast / handled
    if ([this.config.join, this.config.leave].includes(event)) {
      return;
    }

    // Broadcast to all sockets inside chat topic
    this.broadcast({ topic }, { id, event, data });
  };
}

module.exports.createEcho = createEcho;

module.exports.chat = createEcho("chat");
