'use strict'

const baseConfig = require('./config')
const { takeId, freeId, generateId } = require('./ids')

/**
 * @param {BouncerConfig} userConfig
 * @type {UWSRoomManager}
 */
class UWSRoomManager {
  constructor(userConfig = {}) {
    this.config = { ...baseConfig, ...userConfig }
    this.rooms = new Map()
  }

  /**
   * @param {WebSocket} ws
   * @param {string} event
   * @param {Object} data
   * @returns {boolean}
   */
  _onEvent(topic, ws, event, data) {
    // Optional call plugin if exists
    const action = this.config.plugins[topic]

    if (typeof action !== 'undefined') {
      action.call(this, ws, { id: ws.id, event, data })

      return true
    }

    return false
  }

  /**
   * runs _onEvent on each topic of socket
   * @param {WebSocket} ws
   * @param {string} event
   * @param {any} data
   */
  onEvent(ws, event, data) {
    for (let topic of ws.topics) {
      this._onEvent(topic, ws, event, data)
    }
  }

  /**
   * @param {WebSocket} ws
   * @param {string} topic
   * @returns {boolean}
   */
  join(ws, topic) {
    ws.topics = ws.topics || new Set()

    if (ws.topics.has(topic)) {
      return false
    }

    // lazy create room
    if (!this.rooms.has(topic)) {
      this.rooms.set(topic, new Map())
    }

    // get reference to room
    const room = this.rooms.get(topic)

    // first of all create id if not already there
    ws.id = ws.id || this.generateId()

    // occupy id
    takeId(ws.id)

    // set topic
    ws.topics.add(topic)

    // occupy room
    room.set(ws.id, ws)

    // notify all including self of joining in this room
    // uses only joining topic
    this.broadcast(
      { topic },
      { event: this.config.join, id: ws.id, data: topic }
    )

    if (this.config.debug) {
      console.log({ [this.config.join]: { topic, id: ws.id } })
    }

    return true
  }

  /**
   * @param {WebSocket} ws
   * @returns {boolean}
   */
  leave(ws, topic) {
    if (!ws.topics || !ws.topics.has(topic)) {
      return false
    }

    // get reference to room
    const room = this.rooms.get(topic) || new Map()

    // free id
    freeId(ws.id)

    // remove sock from room
    room.delete(ws.id)

    // notify others in this room (after leaving, without self)
    // uses all ws former topics
    this.broadcast(
      { topic },
      { event: this.config.leave, id: ws.id, data: topic }
    )

    // possibly clear room
    if (room.size === 0) {
      this.rooms.delete(topic)
    }

    if (this.config.debug) {
      console.log({ [this.config.leave]: { topic, id: ws.id } })
    }

    ws.topics.delete(topic)

    return true
  }

  /**
   * @param {{ topic }} containingTopic
   * @param {BouncerMessageObject} message
   */
  broadcast({ topic }, data) {
    if (this.rooms.has(topic)) {
      for (const [roomName, ws] of this.rooms.get(topic)) {
        try {
          this.send(ws, data)
        } catch (err) {
          console.error(roomName, err)
        }
      }
    }
  }

  /**
   * @param {WebSocket} ws
   * @param {string|object} message
   */
  send(ws, message) {
    ws.send(
      typeof message === 'string' ? message : JSON.stringify(message, null, 2)
    )
  }

  /**
   * override to use your custom socket id generator
   * you don't have to check for unique
   */
  generateId() {
    return generateId(this.config.idConfig)
  }
}

module.exports = UWSRoomManager
