describe("GIVEN bouncer is provided", () => {
  it("THEN requiring the library does not throw an error", () => {
    expect(require(".")).not.toThrow();
  });

  describe("WHEN it is instantiated", () => {
    it("THEN it should initialize without throwing error", () => {
      const bouncerJs = require(".");

      expect(bouncerJs).not.toThrow();
    });

    it("THEN initialization should return a truthy instance", () => {
      const bouncerJs = require(".");

      expect(bouncerJs()).toBeTruthy();
    });
  });

  describe("WHEN bouncer is initialized in debug mode", () => {
    it("THEN it should not throw error", () => {
      const bouncerJs = require(".");
      const bouncer = bouncerJs({ debug: true });

      expect(bouncer).toBeTruthy();
    });
  });

  describe("WHEN bouncer is initialized on specified port", () => {
    it("THEN it should start without error", () => {
      const bouncerJs = require(".");
      const { bouncer } = bouncerJs({ port: 8080 });

      expect(bouncer).toBeTruthy();
    });
  });

  describe("WHEN bouncer is initialized with plugin", () => {
    it("THEN it should start without error", (done) => {
      const bouncerJs = require(".");
      const { config, send } = bouncerJs({
        debug: false,
        port: 8081,
        plugins: {
          chat: function (ws, message) {
            send(ws, message);
          },
        },
      });

      const WebSocket = require("ws");
      const socket = new WebSocket("ws://localhost:8081");

      socket.onmessage = ({ data: string }) => {
        const { id, event, data } = JSON.parse(string);

        expect(data).toBeTruthy();
        expect(id).toBeTruthy();
        expect(event).toBe(config.join);

        done();
      };

      socket.onopen = () => {
        send(socket, { event: config.join, data: "chat" });
      };
    });
  });
});
