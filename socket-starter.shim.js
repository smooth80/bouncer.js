"use strict";

const io = {
  emit: function (event, data) {
    this.io.broadcast(this.socket, { id: this.socket.id, event, data });
  },
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
    const context = { socket: ws, io: this, data };

    // context = broadcaster instance
    this.emit = this.emit || io.emit.bind(context);

    ws.callbacks = ws.callbacks || [];
    ws.on = ws.on || io.ws.on.bind(context);
    ws.emit = ws.emit || io.ws.emit.bind(context);

    if (!plugin.initialized) {
      plugin.initialized = true;
      plugin.initialize && plugin.initialize.call({ socket: ws }, this);
    }

    if (!ws.handshaken) {
      ws.handshaken = true;
      plugin.handshake && plugin.handshake.call(context, ws, data);
    }

    ws.callbacks.forEach((callback) =>
      callback.call(context, { id, event, data }),
    );
  };
}

module.exports = shim;
