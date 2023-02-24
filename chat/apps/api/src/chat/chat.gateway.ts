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
import { ChatService } from './chat.service';
import { IUserMessage } from './interfaces/IUserMessage';

@WebSocketGateway({ path: '/chat', serveClient: false, cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  constructor(private readonly chatService: ChatService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('room.join')
  OnChannelCreate(@Payload() data: any, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (client.rooms.has(data)) return;
    if (id && data && typeof data == 'string') {
      this.logger.log(
        `room.join: ${client.id}, user: ${id}, channel_id: ${data}`,
      );
      this.chatService
        .joinRoom(id, data)
        .then((_) => {
          client.join(data);
          client.to('id').emit('room.join', {
            statusCode: 200,
            user_id: id,
            channel_id: data,
          });
          client.emit('room.join', {
            statusCode: 200,
            user_id: id,
            channel_id: data,
          });
        })
        .catch((err) => client.emit('room.join', err));
    }
  }

  @SubscribeMessage('message.create')
  OnMessage(@Payload() data: IUserMessage, @ConnectedSocket() client: Socket) {
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
        client.emit('room.join', err);
      });
  }

  handleConnection(client: Socket) {
    const id = client?.handshake?.auth?.token;
    this.logger.log(`connected: ${client.id} auth: ${id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`disconnect: ${client.id}`);
  }
}

// room.join {user_id, channel_id}
// room.leave {user_id, channel_id}
// message.typing {user_id}
// message.create {user_id, channel_id, data}
// message.update ?
// message.delete ?
