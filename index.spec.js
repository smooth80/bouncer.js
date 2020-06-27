describe("GIVEN bouncer is provided", () => {
  it("THEN requiring the library does not throw an error", () => {
    require(".");
  });

  describe("WHEN it is instantiated", () => {
    it("THEN it should initialize without throwing error", () => {
      const BouncerJs = require(".");

      expect(() => new BouncerJs()).not.toThrow();
    });

    it("THEN initialization should return a truthy instance", () => {
      const BouncerJs = require(".");

      expect(new BouncerJs()).toBeTruthy();
    });
  });

  describe("WHEN bouncer is initialized in debug mode", () => {
    it("THEN it should not throw error", () => {
      const BouncerJs = require(".");
      const api = new BouncerJs({ debug: true });

      expect(api).toBeTruthy();
    });
  });

  describe("WHEN bouncer is initialized on specified port", () => {
    it("THEN it should start without error", () => {
      const BouncerJs = require(".");
      const { router } = new BouncerJs({ port: 8080 });

      expect(router).toBeTruthy();
    });
  });

  describe("WHEN bouncer is initialized with plugin", () => {
    it("THEN it should start without error", (done) => {
      const BouncerJs = require(".");
      const { config, send } = new BouncerJs({
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

        socket.close();

        done();
      };

      socket.onopen = () => {
        send(socket, { event: config.join, data: "chat" });
      };
    });
  });
});
