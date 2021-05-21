import { __awaiter, __decorate, __metadata, __param } from 'tslib'
import { Inject, Injectable } from '@angular/core'
import UWebSocket from '../../../client'
import { Subject } from 'rxjs'
let ChatService = class ChatService {
  constructor(window) {
    this.window = window
    this.topic = 'chat'
    this.joinEvent = '/join'
    this.message = new Subject()
    this.messages = []
    this.messagesLimit = 1000
  }
  connect(address = this.window.location.origin.replace(/^http/, 'ws')) {
    return __awaiter(this, void 0, void 0, function* () {
      // connect to parameters
      yield new Promise((resolve) => {
        this.socket = new UWebSocket(address)
        this.socket.onopen = resolve
      })
      if (!this.socket) {
        return
      }
      // handshake with topic on server
      this.socket.emitEvent(this.joinEvent, this.topic)
      // on every message emit message
      this.socket.on('*', (message) => {
        if (!this.id) {
          this.id = message.id
        }
        this.messages.push(message)
        this.messages.splice(-this.messagesLimit)
        this.message.next(message)
      })
      this.socket.onmessage = console.info.bind(console)
    })
  }
}
ChatService = __decorate(
  [
    Injectable({
      providedIn: 'root'
    }),
    __param(0, Inject('Window')),
    __metadata('design:paramtypes', [Window])
  ],
  ChatService
)
export { ChatService }
//# sourceMappingURL=chat.service.js.map
