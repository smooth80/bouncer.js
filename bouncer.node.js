const bouncerJs = require("./bouncer");

bouncerJs({
  debug: true,
  plugins: {
    chat: function (ws, message) {
      console.log(message);

      ws.send(JSON.stringify(message));
    },
  },
});
