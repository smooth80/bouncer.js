const bouncerJs = require("./index");

async function start(params) {
  return new Promise((resolve) => {
    const { config, plugins: oldPlugins } = params || {};

    const plugins = Object.entries(oldPlugins || {}).reduce(
      (mappedPlugins, [pluginName, plugin]) => {
        return {
          [pluginName]: {
            handshake: function (ws, data) {
              ws.onmessage = plugin.bind(this.io);
            },
            initialize: function (io) {
              this.io = io;
            },
          },
          ...mappedPlugins,
        };
      },
      {},
    );

    resolve(
      bouncerJs({
        config,
        plugins,
      }),
    );
  });
}

module.exports = start;
