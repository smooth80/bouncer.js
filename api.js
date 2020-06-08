module.exports = (rooms, config) => {
  /**
   * @param {WebSocket} ws
   * @param {string} topic
   *
   * @returns {boolean}
   */
  function join(ws, topic) {
    if (ws.topic) return false;

    const room = rooms.get(topic) || new Map();

    ws.id = ws.id || config.createSocketId();

    room.set(ws.id, ws);
    rooms.set(topic, room);

    ws.topic = topic;

    if (config.debug) {
      console.log({ join: { topic: ws.topic, id: ws.id } });
    }

    broadcast(ws.topic, {
      id: ws.id,
      event: config.join,
      data: ws.topic,
    });

    return true;
  }

  /**
   * @param {WebSocket} ws
   *
   * @returns {boolean}
   */
  function leave(ws) {
    if (!ws.topic) return false;

    const room = rooms.get(ws.topic) || new Map();

    room.delete(ws.id);
    rooms.set(ws.topic, room);

    if (config.debug) {
      console.log({ leave: { topic: ws.topic, id: ws.id } });
    }

    broadcast(ws.topic, {
      id: ws.id,
      event: config.leave,
      data: ws.topic,
    });

    delete ws.topic;

    return true;
  }

  /**
   * @param {string} topic
   * @param {object} message
   */
  function broadcast(topic, { id, event, data }) {
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
    send,
    join,
    leave,
    broadcast,
  };
};
