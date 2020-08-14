"use strict";

const BouncerJs = require(".");

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
    const shim = require("./shim");

    expect(shim).not.toThrow();
  });

  it("THEN running the library-shim does not throw an error", () => {
    const shim = require("./shim");

    const plugin = shim({ handshake: () => {}, initialize: () => {} });

    expect(plugin).toBeTruthy();
  });

  describe("AND old style format plugin is provided", () => {
    it("THEN running the library-shim does not throw an error", () => {
      const shim = require("./shim");
      const chat = shim(socketStarterFormat.plugins.chat);
      const { router } = new BouncerJs({
        plugins: {
          chat: shim({
            handshake: chat,
          }),
        },
      });

      expect(router).toBeTruthy();
    });

    it("THEN it should start without error", (done) => {
      const shim = require("./shim");
      const bouncer = new BouncerJs({
        port: 8090,
        debug: false,
        plugins: {
          any: shim({
            handshake: (ws, { id, event, data }) => {
              console.log("-- backend receive message:", { id, event, data });
              if (event === bouncer.config.join) {
                bouncer.send(ws, { event: "test", data: "chat", id });
              }
            },
          }),
        },
      });

      const { config } = bouncer;
      const WebSocket = require("ws");
      const socket = new WebSocket("ws://localhost:8090");

      socket.on("open", () => {
        console.log("-- send handshake");
        socket.send(
          JSON.stringify({
            id: socket.id,
            event: config.join,
            data: "any",
          }),
        );
      });

      socket.on("message", (message) => {
        const { id, event, data } = JSON.parse(message);

        if (event !== bouncer.config.leave) {
          console.log("-- frontend receive message", { id, event, data });
        }

        expect(id).toBeTruthy();
        expect(data).toBe("chat");

        socket.close();

        done();
      });
    });
  });

  it("THEN running the library-shim with config in old format does not throw an error", () => {
    const shim = require("./shim");

    const plugin = shim(socketStarterFormat.plugins.chat);

    expect(plugin).toBeTruthy();
  });

  it("THEN running the library-shim with config in old format on port: 8100 does not throw an error", () => {
    const shim = require("./shim");
    const chat = shim(socketStarterFormat.plugins.chat);
    const api = new BouncerJs(
      Object.assign(socketStarterFormat, {
        plugins: { chat },
        port: 8100,
      }),
    );

    expect(api.join).toBeTruthy();
    expect(api.leave).toBeTruthy();
    expect(api.broadcast).toBeTruthy();
    expect(api.send).toBeTruthy();
  });
});
