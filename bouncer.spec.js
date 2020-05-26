describe("GIVEN bouncer is provided", () => {
  it("THEN requiring the library does not throw an error", () => {
    expect(require("./bouncer")).not.toThrow();
  });

  describe("WHEN it is instantiated", () => {
    it("THEN it should initialize without throwing error", () => {
      const bouncerJs = require("./bouncer");

      expect(bouncerJs).not.toThrow();
    });

    it("THEN initialization should return a truthy instance", () => {
      const bouncerJs = require("./bouncer");

      expect(bouncerJs()).toBeTruthy();
    });
  });

  describe("WHEN bouncer is initialized in debug mode", () => {
    it("THEN it should not throw error", () => {
      const bouncerJs = require("./bouncer");
      const bouncer = bouncerJs({ debug: true });

      expect(bouncer).toBeTruthy();
    });
  });

  describe("WHEN bouncer is initialized on specified port", () => {
    it("THEN it should not throw error", () => {
      const bouncerJs = require("./bouncer");
      const bouncer = bouncerJs({ debug: true, port: 8081 });

      expect(bouncer).toBeTruthy();
    });
  });
});
