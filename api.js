"use strict";

const baseConfig = require("./config.js");
const { takeId, freeId, generateId } = require("./ids.js");

/**
 * @param {BouncerConfig} userConfig
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

    // lazy create room
    if (!this.rooms.has(topic)) {
      this.rooms.set(topic, new Map());
    }

    // get reference to room
    const room = this.rooms.get(topic);

    // first of all create id if not already there
    ws.id = ws.id || this.generateId();

    // occupy id
    takeId(ws.id);

    // set topic
    ws.topic = topic;

    // occupy room
    room.set(ws.id, ws);

    // notify all including self of joining in room
    // uses ws.topic
    this.broadcast(ws, { event: this.config.join, id: ws.id, data: ws.topic });

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

    // get reference to room
    const room = this.rooms.get(ws.topic) || new Map();

    // free id
    freeId(ws.id);

    // remove sock from room
    room.delete(ws.id);

    // notify others in this room (after leaving, without self)
    // uses ws.topic
    this.broadcast(ws, { event: this.config.leave, id: ws.id, data: ws.topic });

    // possibly clear room
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

  /**
   * override to use your custom socket id generator
   * you don't have to check for unique
   */
  generateId() {
    return generateId(this.config.idConfig);
  }
}

module.exports = UWSRoomManager;
