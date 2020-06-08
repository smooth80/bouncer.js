describe("GIVEN bouncer is provided", () => {
  const socketStarterFormat = {
    config: {
      join: "handshake",
    },
    plugins: {
      chat: {
        handshake: (...args) => console.log("handshake works", args),
        initilize: (...args) => console.log("initialize works", args),
      },
    },
  };

  it("THEN requiring the library-shim does not throw an error", () => {
    const starter = require("./socket-starter.shim");

    expect(starter).not.toThrow();
  });

  it("THEN running the library-shim does not throw an error", (done) => {
    const starter = require("./socket-starter.shim");

    starter()
      .then((api) => {
        expect(api).toBeTruthy();

        done();
      })
      .catch(done);
  });

  it("THEN running the library-shim with config in old format does not throw an error", (done) => {
    const starter = require("./socket-starter.shim");

    starter(socketStarterFormat)
      .then((api) => {
        expect(api).toBeTruthy();

        done();
      })
      .catch(done);
  });

  it("THEN running the library-shim with config in old format does not throw an error", (done) => {
    const starter = require("./socket-starter.shim");

    starter(Object.assign(socketStarterFormat, { port: 8100 }))
      .then((api) => {
        expect(api.join).toBeTruthy();
        expect(api.leave).toBeTruthy();
        expect(api.broadcast).toBeTruthy();
        expect(api.send).toBeTruthy();

        done();
      })
      .catch(done);
  });
});
