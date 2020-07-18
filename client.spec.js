"use strict";

describe("GIVEN Client", () => {
  describe("WHEN bouncer is initialized with plugin", () => {
    it("THEN it should start without error", (done) => {
      const BouncerJs = require(".");
      const { config, send } = new BouncerJs({
        debug: false,
        port: 3003,
        plugins: {
          chat: function (ws, message) {
            send(ws, message);
          },
        },
      });

      const UWebSocket = require("./client");
      const socket = new UWebSocket("ws://localhost:3003");

      socket.id = "whatever";

      socket.onmessage = ({ id, event, data }) => {
        expect(data).toBeTruthy();
        expect(id).toBeTruthy();
        expect(event).toBe(config.join);

        socket.close();

        done();
      };

      socket.onopen = () => {
        socket.emit({ event: config.join, data: "chat" });
      };
    });
  });
});
