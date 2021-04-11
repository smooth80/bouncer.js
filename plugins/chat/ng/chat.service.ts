import { Inject, Injectable } from '@angular/core'
import UWebSocket from '../../../client'
import { Subject } from 'rxjs'

export type TMessage = { id: string; event: string; data: any }

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  topic: string = 'chat'
  joinEvent: string = '/join'

  id?: string
  socket?: UWebSocket

  message = new Subject()
  messages: TMessage[] = []
  messagesLimit: number = 1000

  constructor(@Inject('Window') protected window: Window) {}

  async connect(
    address: string = this.window.location.origin.replace(/^http/, 'ws')
  ) {
    // connect to parameters
    await new Promise((resolve) => {
      this.socket = new UWebSocket(address)
      this.socket.onopen = resolve
    })

    if (!this.socket) {
      return
    }

    // handshake with topic on server
    this.socket.emitEvent(this.joinEvent, this.topic)

    // on every message emit message
    this.socket.on('*', (message: TMessage) => {
      if (!this.id) {
        this.id = message.id
      }

      this.messages.push(message)
      this.messages.splice(-this.messagesLimit)

      this.message.next(message)
    })

    this.socket.onmessage = console.log.bind(console)
  }
}
