/**
 * A module for bouncerJs API helper functions.
 * @module BouncerAPIFactory
 */

function api(rooms, config) {
  /**
   * @param {WebSocket} ws
   * @param {string} event
   * @param {Object} data
   * @returns {boolean}
   */
  function run(ws, event, data) {
    // Optional call plugin if exists
    const action = ws.topic && config.plugins[ws.topic];

    if (typeof action !== "undefined") {
      action(ws, { id: ws.id, event, data });

      return true;
    }

    return false;
  }

  /**
   * @param {WebSocket} ws
   * @param {string} topic
   * @returns {boolean}
   */
  function join(ws, topic) {
    if (ws.topic) return false;

    const room = rooms.get(topic) || new Map();

    ws.id = ws.id || config.createSocketId();
    ws.topic = topic;

    room.set(ws.id, ws);
    if (!rooms.get(ws.topic)) {
      rooms.set(ws.topic, room);
    }

    if (config.debug) {
      console.log({ [config.join]: { topic: ws.topic, id: ws.id } });
    }

    return true;
  }

  /**
   * @param {WebSocket} ws
   * @returns {boolean}
   */
  function leave(ws) {
    if (!ws.topic) return false;

    const room = rooms.get(ws.topic) || new Map();

    room.delete(ws.id);
    if (!rooms.get(ws.topic)) {
      rooms.set(ws.topic, room);
    }

    if (room.size === 0) {
      rooms.delete(ws.topic);
    }

    if (config.debug) {
      console.log({ [config.leave]: { topic: ws.topic, id: ws.id } });
    }

    delete ws.topic;

    return true;
  }

  /**
   * @param {{ topic }} containingTopic
   * @param {BouncerMessageObject} message
   */
  function broadcast({ topic }, { id, event, data }) {
    if (rooms.has(topic)) {
      for (const [roomName, ws] of rooms.get(topic)) {
        try {
          send(ws, { id, event, data });
        } catch (err) {
          console.error(roomName, err);
        }
      }
    }
  }

  /**
   * @param {string|object} message
   */
  function send(ws, message) {
    switch (typeof message) {
      case "string":
        ws.send(message);
        break;
      default:
        ws.send(JSON.stringify(message, null, 2));
    }
  }

  return {
    run,
    send,
    join,
    leave,
    broadcast,
  };
}

module.exports = api;
