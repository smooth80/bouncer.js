"use strict";

/**
 * @param {WebSocket} ws
 * @param {BouncerMessageObject} message
 */
function chat(ws, { id, event, data }) {
  // Broadcast to all sockets inside chat topic
  this.broadcast({ topic: "chat" }, { id, event, data });

  if (this.config.debug) {
    console.log({ id, event, data });
  }
}

module.exports = chat;
