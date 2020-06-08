module.exports = (rooms, config) => {
  /**
   * @param {WebSocket} ws
   * @param {string} event
   * @param {object} data
   * @returns {boolean}
   */
  function run(ws, event, data) {
    // Optional call plugin if exists
    const action = ws.topic && config.plugins[ws.topic];

    if (typeof action !== "undefined") {
      action(ws, { id: ws.id || id, event, data });

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
      console.log({ join: { topic: ws.topic, id: ws.id } });
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
      console.log({ leave: { topic: ws.topic, id: ws.id } });
    }

    delete ws.topic;
  }

  /**
   * @param {object} containingTopic
   * @param {object} message
   */
  function broadcast({ topic }, { id, event, data }) {
    const room = rooms.get(topic);

    if (room) {
      for (let [roomName, ws] of room) {
        try {
          send(ws, { id, event, data });
        } catch (err) {
          console.error(roomName, err);
        }
      }
    }
  }

  /**
   * @param {string} message
   */
  function send(ws, message) {
    switch (typeof message) {
      case "string":
        ws.send(message);
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
};
