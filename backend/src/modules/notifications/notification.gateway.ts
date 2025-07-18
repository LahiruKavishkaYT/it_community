import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'notifications', cors: { origin: '*' } })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  emitToUser(userId: string, payload: any) {
    // use room named by userId; clients join after connection
    this.server.to(userId).emit('notification', payload);
  }

  handleConnection(client: any) {
    // expect client to send userId in query string for simple demo
    const { userId } = client.handshake.query;
    if (userId) {
      client.join(userId as string);
    }
  }
} 