const { createSocketId } = require("./config");

describe("GIVEN bouncer is provided", () => {
  const socketStarterFormat = {
    config: {
      join: "handshake",
    },
    plugins: {
      chat: {
        handshake: () => null,
        initialize: () => null,
      },
    },
  };

  it("THEN requiring the library-shim does not throw an error", () => {
    const shim = require("./socket-starter.shim");

    expect(shim).not.toThrow();
  });

  it("THEN running the library-shim does not throw an error", () => {
    const shim = require("./socket-starter.shim");

    const api = shim();

    expect(api).toBeTruthy();
  });

  describe("AND old style format plugin is provided", () => {
    it("THEN running the library-shim does not throw an error", () => {
      const shim = require("./socket-starter.shim");

      const { router } = shim({
        plugins: {
          chat: require("socket-starter/example/chat"),
        },
      });

      expect(router).toBeTruthy();
    });

    it("THEN it should start without error", (done) => {
      const shim = require("./socket-starter.shim");

      const { config } = shim({
        port: 8090,
        plugins: {
          chat: require("socket-starter/example/chat"),
        },
      });

      const WebSocket = require("ws");
      const socket = new WebSocket("ws://localhost:8090");

      socket.id = createSocketId();

      socket.on("open", () => {
        socket.emit(config.join, {
          id: socket.id,
          event: config.join,
          data: "chat",
        });
      });

      socket.on(config.join, ({ id, event, data }) => {
        expect(id).toBeTruthy();
        expect(event).toBe(config.join);
        expect(data).toBe("chat");

        done();

        socket.close();
      });
    });
  });

  it("THEN running the library-shim with config in old format does not throw an error", () => {
    const shim = require("./socket-starter.shim");

    const api = shim(socketStarterFormat);

    expect(api).toBeTruthy();
  });

  it("THEN running the library-shim with config in old format on port: 8100 does not throw an error", () => {
    const shim = require("./socket-starter.shim");

    const api = shim(Object.assign(socketStarterFormat, { port: 8100 }));

    expect(api.join).toBeTruthy();
    expect(api.leave).toBeTruthy();
    expect(api.broadcast).toBeTruthy();
    expect(api.send).toBeTruthy();
  });
});
