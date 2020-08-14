"use strict";

const io = {
  ws: {
    on: function (trigger, callback) {
      this.socket.callbacks.push(({ id, event, data }) => {
        if (event === trigger) {
          callback({ id: id || this.socket.id, event, data });
        }
      });
    },
    emit: function (event, data) {
      this.socket.send(JSON.stringify({ id: this.socket.id, event, data }));
    },
  },
};

/**
 * @param {function[]} all
 * @param {any[]} entry
 */
function shim(plugin) {
  return function shimPlugin(ws, { id, event, data }) {
    const wsContext = { ...this, socket: ws };

    ws.callbacks = ws.callbacks || [];
    ws.on = ws.on || io.ws.on.bind(wsContext);
    ws.emit = ws.emit || io.ws.emit.bind(wsContext);

    if (!plugin.initialized) {
      plugin.initialized = true;
      plugin.initialize && plugin.initialize.call(this, this);
    }

    if (!ws.handshaken) {
      ws.handshaken = true;
      plugin.handshake && plugin.handshake.call(this, ws, { id, event, data });
    }

    ws.callbacks.forEach((callback) =>
      callback.call(wsContext, { id, event, data }),
    );
  };
}

module.exports = shim;
