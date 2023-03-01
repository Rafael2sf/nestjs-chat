import { Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { ChatClientService } from './chat-client.service';

@WebSocketGateway({ path: '/chat', serveClient: false, cors: { origin: '*' } })
export class ChatClientGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatClientGateway.name);
  constructor(private readonly chatService: ChatClientService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('room.join')
  OnRoomJoin(@Payload() data: any, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (client.rooms.has(data)) return;
    if (id && data && typeof data == 'string') {
      this.logger.log(
        `room.join: ${client.id}, user: ${id}, channel_id: ${data}`,
      );
      this.chatService
        .joinRoom(id, data)
        .then((_) => {
          client.to(data).to(client.id).emit('room.join', {
            statusCode: 200,
            user_id: id,
            channel_id: data,
          });
          client.emit('room.join', {
            statusCode: 200,
            user_id: id,
            channel_id: data,
          });
          client.join(data);
        })
        .catch((err) => client.emit('room.join', err));
    }
  }

  @SubscribeMessage('room.leave')
  OnRoomLeave(@Payload() data: any, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (client.rooms.has(data)) {
      this.logger.log(
        `room.leave: ${client.id}, user_id: ${id}, channel_id: ${data}`,
      );
      client.leave(data);
      client
        .to(data)
        .emit('room.leave', { statusCode: 200, user_id: id, channel_id: data });
    }
  }

  @SubscribeMessage('message.create')
  OnMessage(@Payload() data: any, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    this.chatService
      .createMessage({
        user_id: id,
        channel_id: data.channel_id,
        data: data.data,
      })
      .then((_) => {
        this.logger.log(
          `message.create: ${client.id}, user_id: ${id}, channel_id: ${data.channel_id}, data: ${data.data}`,
        );
        client.to(data.channel_id).emit('message.create', {
          user_id: id,
          channel_id: data.channel_id,
          data: data.data,
        });
        client.emit('message.create', {
          user_id: id,
          channel_id: data.channel_id,
          data: data.data,
        });
      })
      .catch((err) => {
        client.emit('message.create', err);
      });
  }

  handleConnection(client: Socket) {
    const id = client?.handshake?.auth?.token;
    this.logger.log(`connected: ${client.id} auth: ${id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`disconnect: ${client.id}`);
    client.rooms.forEach((elem) => client.leave(elem));
  }
}

// room.join {user_id, channel_id}
// room.leave {user_id, channel_id}
// message.typing {user_id}
// message.create {user_id, channel_id, data}
// message.update ?
// message.delete ?
