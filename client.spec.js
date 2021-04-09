'use strict'

const BouncerJs = require('.')
const UWebSocket = require('./client')

describe('GIVEN Client', () => {
  describe('WHEN bouncer is initialized with plugin', () => {
    let config
    let send
    let socket

    beforeEach(() => {
      const bouncer = new BouncerJs({
        debug: false,
        port: 3003,
        plugins: {
          chat: function (ws, message) {
            send(ws, message)
          }
        }
      })

      config = bouncer.config
      send = bouncer.send

      socket = new UWebSocket('ws://localhost:3003')
      socket.id = 'whatever'
    })

    it('THEN it should work on basic socket.emit message', (done) => {
      socket.onmessage = ({ id, event, data }) => {
        expect(data).toBeTruthy()
        expect(id).toBeTruthy()
        expect(event).toBe(config.join)

        socket.close()

        done()
      }

      socket.onopen = () => {
        socket.emit({ event: config.join, data: 'chat' })
      }
    })

    it('THEN it should work on basic socket.io-client-ish.emitEvent message', (done) => {
      socket.onmessage = ({ id, event, data }) => {
        expect(data).toBeTruthy()
        expect(id).toBeTruthy()
        expect(event).toBe(config.join)

        socket.close()

        done()
      }

      socket.onopen = () => {
        socket.emitEvent(config.join, 'chat')
      }
    })
  })
})
