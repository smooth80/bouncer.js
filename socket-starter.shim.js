const BouncerJs = require("./index");

let instance;

/**
 * Input outcluding plugins (which are socket-starter format)
 * are all compatible with original bouncerJS
 * @param {BouncerConfig} params
 * @returns {BouncerCallResult}
 */
function shim(params = {}) {
  const { plugins: old } = params;
  const plugins = Object.entries(old || {}).reduce(reducer, {});

  instance = new BouncerJs({
    ...params,
    plugins,
  });

  return instance;
}

const io = {
  on: function (ws, plugin, event) {
    switch (event) {
      case "connect":
      case "connection":
        if (!plugin.initialized) {
          plugin.initialized = true;
          plugin.initialize.call({ socket: ws }, this);
        }
    }
  },
  emit: function (event, data) {
    instance.broadcast(this.socket, { id: this.socket.id, event, data });
  },
  ws: {
    on: function (event, callback) {
      callback({ id: this.socket.id, event });
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
function reducer(all, [name, plugin]) {
  return {
    [name]: function (ws, { id, event, data }) {
      const context = { socket: ws, io: this };

      // context = broadcaster instance
      this.on = this.on || io.on.bind(this, ws, plugin);
      this.emit = this.emit || io.emit.bind(context);

      ws.on = ws.on || io.ws.on.bind(context);
      ws.emit = ws.emit || io.ws.emit.bind(context);

      if (!ws.handshaken) {
        ws.handshaken = true;
        plugin.handshake.call(context, ws, data);
      }
    },
    ...all,
  };
}

module.exports = shim;
