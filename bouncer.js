const http = require("http");
const socketIo = require("socket.io");

const {
  PORT,
  LOGO,
  ACCESS_CONTROL_ALLOW_ORIGIN,
  ACCESS_CONTROL_ALLOW_HEADERS,
} = require("./config");

const preflightHeadersFactory = (req) => ({
  "Access-Control-Allow-Headers": ACCESS_CONTROL_ALLOW_HEADERS,
  "Access-Control-Allow-Origin":
    ACCESS_CONTROL_ALLOW_ORIGIN || req.headers.origin,
  "Access-Control-Allow-Credentials": true,
});

function handlePreflightRequest(req, res) {
  res.writeHead(200, preflightHeadersFactory(req));
  res.end();
}

/**
 * Usage:
 *
 * const plugins = Array<(io, socket, data) => void>
 *
 * new Bouncer(plugins)
 *   .createServer(express())
 *   .connect()
 */
module.exports = class Bouncer {
  /**
   * Initialize bouncer with plugins array
   *
   * @param {function[]} plugins
   */
  constructor(plugins) {
    this.plugins = new Set(plugins || []);

    this.speak("started");
  }
  /**
   * Speak with logo at the start
   * helper function
   *
   * @param {string} sentence
   */
  speak(sentence) {
    console.log(`${LOGO} ${sentence}`);
  }
  /**
   * Create http server instance for express app
   * chainable
   *
   * @param {Express} expressApp
   */
  createServer(expressApp) {
    this.httpServer = http.Server(expressApp);
    this.httpServer.listen(PORT);

    this.speak(`listens @ ${PORT}`);

    return this;
  }
  /**
   * Connects to created server instance
   * chainable
   */
  connect() {
    this.io = socketIo(this.httpServer, { handlePreflightRequest });
    this.io.on("connection", (socket) => this.onSocketConnect(socket));

    return this;
  }
  /**
   * On socket connection this function is run so the bouncer
   * Knows that after a handshake the room is joined and plugin
   * is initialized
   * helper function
   *
   * @param {Socket} socket
   */
  onSocketConnect(socket) {
    this.speak("socket @ door");
    this.plugins.forEach((plugin) => {
      socket.on(`handshake:${plugin.name}`, (data) => {
        this.speak(`joins ${plugin.name}`);
        socket.join(plugin.name);
        plugin.call(this, socket, data);
      });
    });
  }
};
