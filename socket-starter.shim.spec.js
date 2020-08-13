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
    const shim = require("./socket-starter.shim");

    expect(shim).not.toThrow();
  });

  it("THEN running the library-shim does not throw an error", () => {
    const shim = require("./socket-starter.shim");

    const plugin = shim({ handshake: () => {}, initialize: () => {} });

    expect(plugin).toBeTruthy();
  });

  describe("AND old style format plugin is provided", () => {
    it("THEN running the library-shim does not throw an error", () => {
      const shim = require("./socket-starter.shim");

      const { router } = new BouncerJs({
        plugins: {
          chat: shim({
            handshake: require("./chat"),
          }),
        },
      });

      expect(router).toBeTruthy();
    });

    it("THEN it should start without error", (done) => {
      const shim = require("./socket-starter.shim");

      const { config } = new BouncerJs({
        port: 8090,
        plugins: {
          chat: shim({
            handshake: require("./chat")
          }),
        },
      });

      const WebSocket = require("ws");
      const socket = new WebSocket("ws://localhost:8090");

      socket.on("open", () => {
        socket.send(
          JSON.stringify({
            event: config.join,
            data: "chat",
          }),
        );
      });

      socket.on("message", (message) => {
        const { id, event, data } = JSON.parse(message);

        if (event === "joined") {
          expect(id).toBeTruthy();
          expect(data).toBe("chat");

          socket.close();

          done();
        }
      });
    });
  });

  it("THEN running the library-shim with config in old format does not throw an error", () => {
    const shim = require("./socket-starter.shim");

    const plugin = shim(socketStarterFormat.plugins.chat);

    expect(plugin).toBeTruthy();
  });

  it("THEN running the library-shim with config in old format on port: 8100 does not throw an error", () => {
    const shim = require("./socket-starter.shim");

    const plugin = shim(socketStarterFormat.plugins.chat);
    const api = new BouncerJs(
      Object.assign(socketStarterFormat, {
        plugins: { chat: plugin },
        port: 8100,
      }),
    );

    expect(api.join).toBeTruthy();
    expect(api.leave).toBeTruthy();
    expect(api.broadcast).toBeTruthy();
    expect(api.send).toBeTruthy();
  });
});
