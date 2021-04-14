declare module '@jacekpietal/bouncer.js/build/plugins/chat/ng/chat.service' {
  class UWebSocket extends WebSocket {
    emitEvent(event: string, data: any): void;
    emit(data: any): void;
    on(event: string, cb: (...args: any[]) => void): void;
  }

  export class ChatService {
    socket: UWebSocket;
    constructor(window: Window)
    connect(address?: string): void;
  }
}
