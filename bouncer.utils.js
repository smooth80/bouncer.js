module.exports = (rooms, config) => {
  /**
   * @param {WebSocket} ws
   * @param {string} roomName
   *
   * @returns {boolean}
   */
  function joinRoom(ws, roomName) {
    if (ws.topic) return false;

    const room = rooms.get(roomName) || new Map();

    ws.id = ws.id || config.createSocketId();

    room.set(ws.id, ws);
    rooms.set(roomName, room);

    if (config.debug) {
      console.log({ join: { room }, rooms });
    }

    ws.topic = roomName;

    broadcast(ws.topic, {
      id: ws.id,
      event: config.join,
      data: ws.topic,
    });

    return true;
  }

  /**
   * @param {WebSocket} ws
   * @param {string} roomName
   *
   * @returns {boolean}
   */
  function leaveRoom(ws) {
    if (!ws.topic) return false;

    const room = rooms.get(ws.topic) || new Map();

    room.delete(ws.id);
    rooms.set(ws.topic, room);

    if (config.debug) {
      console.log({ leave: { room }, rooms });
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
  function broadcast(topic, message) {
    const room = rooms.get(topic);

    if (room) {
      for (let [, ws] of room) {
        try {
          const plugin = config.plugins[topic];
          if (plugin) {
            plugin(ws, message);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  return {
    joinRoom,
    leaveRoom,
    broadcast,
  };
};
