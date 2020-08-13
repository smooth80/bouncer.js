"use strict";

const baseConfig = require("./config.js");

/**
 * @param {Map} rooms
 * @param {BouncerConfig} config
 * @returns {Partial<BouncerJS>}
 */
class UWSRoomManager {
  constructor(userConfig = {}) {
    this.config = { ...baseConfig, ...userConfig };
    this.rooms = new Map();
  }

  /**
   * @param {WebSocket} ws
   * @param {string} event
   * @param {Object} data
   * @returns {boolean}
   */
  onEvent(ws, event, data) {
    // Optional call plugin if exists
    const action = ws.topic && this.config.plugins[ws.topic];

    if (typeof action !== "undefined") {
      action.call(this, ws, { id: ws.id, event, data });

      return true;
    }

    return false;
  }

  /**
   * @param {WebSocket} ws
   * @param {string} topic
   * @returns {boolean}
   */
  join(ws, topic) {
    if (ws.topic) return false;

    const room = this.rooms.get(topic) || new Map();

    ws.id = ws.id || this.config.createSocketId();
    ws.topic = topic;

    room.set(ws.id, ws);

    if (!this.rooms.get(ws.topic)) {
      this.rooms.set(ws.topic, room);
    }

    if (this.config.debug) {
      console.log({ [this.config.join]: { topic: ws.topic, id: ws.id } });
    }

    return true;
  }

  /**
   * @param {WebSocket} ws
   * @returns {boolean}
   */
  leave(ws) {
    if (!ws.topic) return false;

    const room = this.rooms.get(ws.topic) || new Map();

    room.delete(ws.id);
    if (!this.rooms.get(ws.topic)) {
      this.rooms.set(ws.topic, room);
    }

    if (room.size === 0) {
      this.rooms.delete(ws.topic);
    }

    if (this.config.debug) {
      console.log({ [this.config.leave]: { topic: ws.topic, id: ws.id } });
    }

    delete ws.topic;

    return true;
  }

  /**
   * @param {{ topic }} containingTopic
   * @param {BouncerMessageObject} message
   */
  broadcast({ topic }, data) {
    if (this.rooms.has(topic)) {
      for (const [roomName, ws] of this.rooms.get(topic)) {
        try {
          this.send(ws, data);
        } catch (err) {
          console.error(roomName, err);
        }
      }
    }
  }

  /**
   * @param {string|object} message
   */
  send(ws, message) {
    ws.send(
      typeof message === "string" ? message : JSON.stringify(message, null, 2),
    );
  }
}

module.exports = UWSRoomManager;
