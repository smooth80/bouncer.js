import { Inject, Injectable } from '@angular/core'
import UWebSocket from '../../../client'
import { Subject } from 'rxjs'

export type TMessage = { id: string; event: string; data: any }

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  serverUrl: string

  topic: string = 'chat'
  joinEvent: string = '/join'

  id?: string
  socket?: UWebSocket

  message = new Subject()
  messages: TMessage[] = []
  messagesLimit: number = 1000

  constructor(@Inject('Window') protected window: Window) {
    this.serverUrl = this.window.location.origin.replace(/^http/, 'ws')

    this.initialize()
  }

  send(
    event: string,
    data: any,
    onError: (e: Error) => void = (e) => console.warn(e)
  ) {
    if (!this.socket) {
      throw new Error('Socket not ready')
    }

    try {
      this.socket.emitEvent(event, data)
    } catch (err) {
      onError(err)
    }
  }

  protected async initialize() {
    // connect to parameters
    await this.connect()

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

  protected async connect(): Promise<any> {
    return new Promise((resolve) => {
      this.socket = new UWebSocket(this.serverUrl)
      this.socket.onopen = resolve
    })
  }
}
