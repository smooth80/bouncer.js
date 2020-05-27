module.exports = (rooms, config) => {
  const createSocketId = config.createSocketId;
  const onMessage = config.onMessage;

  /**
   * @param {WebSocket} ws
   * @param {string} roomName
   *
   * @returns {boolean}
   */
  function joinRoom(ws, roomName) {
    if (ws.topic) return false;

    const room = rooms.get(roomName) || new Map();

    ws.id = ws.id || createSocketId();

    room.set(ws.id, ws);
    rooms.set(roomName, room);

    if (config.debug) {
      console.log({ join: { room }, rooms });
    }

    ws.topic = roomName;

    broadcast(ws.topic, {
      author: ws.id,
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
      author: ws.id,
      event: config.leave,
      data: ws.topic,
    });

    delete ws.topic;

    return true;
  }

  /**
   * @param {string} message
   */
  function getRoomName(message) {
    if (message.startsWith(config.join)) {
      return {
        leave: true,
        join: message.slice(config.join.length, message.length),
      };
    }

    if (message.startsWith(config.leave)) {
      return { leave: message.slice(config.leave.length, message.length) };
    }

    return {};
  }

  /**
   * @param {string} topic
   * @param {any} message
   */
  function broadcast(topic, message) {
    const room = rooms.get(topic);

    if (room) {
      for (let [, sock] of room) {
        try {
          onMessage(sock, message, false);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  return {
    joinRoom,
    leaveRoom,
    getRoomName,
    broadcast,
  };
};
