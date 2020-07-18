"use strict";

/**
 * @typedef {UWebSocket | SocketIOClient} UWebSocket
 */
class UWebSocket {
  /**
   * @param {string} serverUrl
   * @returns {WebSocket | SocketIOClient}
   */
  constructor(serverUrl) {
    this.events = [];

    this.ws = new WebSocket(serverUrl);

    this.ws.onmessage = (message) => {
      this.uwsOnMessage(message);
    };

    Object.freeze(this.ws.onmessage);
  }

  /**
   * Sets ws id
   * @param {string|number} id
   */
  set id(id) {
    this.ws.id = id;
  }

  /**
   * Gets ws id
   */
  get id() {
    return this.ws.id;
  }

  /**
   * Sets onopen ws callback
   * @param {function} callback
   */
  set onopen(callback) {
    this.ws.onopen = callback;
  }

  /**
   * Sets onclose ws callback
   * @param {function} callback
   */
  set onclose(callback) {
    this.ws.onclose = callback;
  }

  /**
   * Sets onerror ws callback
   * @param {function} callback
   */
  set onerror(callback) {
    this.ws.onerror = callback;
  }

  /**
   * Adds on any message ws callback
   * @param {function} callback
   */
  set onmessage(callback) {
    this.on("*", callback);
  }

  /**
   * Calls onclose on ws
   */
  close() {
    this.ws.close();
  }

  /**
   * Internal function for on("...", () => {}) callback
   * @param {object} data
   */
  uwsOnMessage({ data: message }) {
    const { id, event, data } =
      typeof message === "string" ? JSON.parse(message) : message;

    this.events.forEach((action) =>
      action({ id: id || this.ws.id, event, data }),
    );
  }

  /**
   * Adds one SocketIOLike.on("...", () => {}) callback
   * @param {string} target
   * @param {function} callback
   */
  on(target, callback) {
    this.events.push(({ id, event, data }) => {
      if ([event, "*"].includes(target)) {
        callback({ id, event, data });
      }
    });
  }

  /**
   * Emits socket.io like object from ws
   * @param {object|string} objectOrString
   */
  emit(objectOrString) {
    this.send(
      typeof objectOrString === "string"
        ? objectOrString
        : JSON.stringify(objectOrString),
    );
  }

  /**
   *
   * @param {string} event
   * @param {any} data
   */
  emitEvent(event, data) {
    this.emit({ event, data, id: this.id });
  }

  /**
   * Sends string from ws
   * @param {string} string
   */
  send(string) {
    this.ws.send(string);
  }
}

try {
  module.exports = UWebSocket;
} catch (err) {
  console.error(err);
}