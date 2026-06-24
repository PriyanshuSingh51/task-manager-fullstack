import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type WebSocketEventHandler = (event: { type: string; payload: unknown }) => void;

class WebSocketService {
  private client: Client | null = null;
  private handlers: WebSocketEventHandler[] = [];

  connect(): void {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        this.client?.subscribe('/topic/tasks', (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            this.handlers.forEach((handler) => handler(data));
          } catch {
            // ignore malformed messages
          }
        });
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
  }

  subscribe(handler: WebSocketEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }
}

export const websocketService = new WebSocketService();
