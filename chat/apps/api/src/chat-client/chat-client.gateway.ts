import { Injectable, Logger } from '@nestjs/common';
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
import {IChannel} from './interfaces/IChannel';

@Injectable()
@WebSocketGateway({ path: '/chat', serveClient: false, cors: { origin: '*' } })
export class ChatClientGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatClientGateway.name);
  constructor(private readonly chatService: ChatClientService) {}
  @WebSocketServer()
  server: Server;

  /**
   * @Brief Remove a specific user from a room
   * @param user_id user unique identifier attacked to the socket
   * @param channel_id room unique identifier
   */
  async forceRoomLeave(user_id: string, channel_id: string) {
    const sockets = await this.server.in(channel_id).fetchSockets();
    for (const socket of sockets) {
      if (socket?.handshake?.auth?.token === user_id) {
        socket.leave(channel_id);
      }
    }
  }

  /**
   * @Brief Remove all sockets in a specific channel
   * @param channel_id room unique identifier
   */
  forceRoomDestroy(channel_id: string) {
    this.server.socketsLeave(channel_id);
  }

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
        .then((channel) => {
          client.to(data).emit('room.join', {
            statusCode: 200,
            user_id: id,
            id: channel.id,
          });
          client.emit('room.join', {
            statusCode: 200,
            user_id: id,
            ...channel,
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
        .emit('room.leave', { statusCode: 200, user_id: id, id: data });
    }
  }

  @SubscribeMessage('message.writing')
  OnMessageWriting(@Payload() data: string, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (client.rooms.has(data)) {
      client.to(data).volatile.emit('message.writing', {
        user_id: id,
        channel_id: data,
      });
    }
  }

  @SubscribeMessage('message.notwriting')
  OnMessageNotWriting(
    @Payload() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    const id = client?.handshake?.auth?.token;
    if (client.rooms.has(data)) {
      client.to(data).volatile.emit('message.notwriting', {
        user_id: id,
        channel_id: data,
      });
    }
  }

  @SubscribeMessage('message.create')
  async OnMessageCreate(@Payload() data: any, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (client.rooms.has(data.channel_id)) {
      try {
        const message_id = await this.chatService.createMessage({
          id: undefined,
          user_id: id,
          channel_id: data.channel_id,
          data: data.data,
        });
        client.to(data.channel_id).emit('message.create', {
          statusCode: 200,
          user_id: id,
          channel_id: data.channel_id,
          id: message_id,
          data: data.data,
        });
        client.emit('message.create', {
          statusCode: 200,
          user_id: id,
          channel_id: data.channel_id,
          id: message_id,
          data: data.data,
        });
      } catch (e) {
        client.emit('message.create', e);
      }
    } else {
      client.emit('message.create', {
        statusCode: 400,
        message: 'Not a member of this room',
      });
    }
  }

  handleConnection(client: Socket) {
    const id = client.handshake.auth?.token;
    const query = client.handshake.query;
    if (query.autojoin === 'true') {
      this.chatService.joinAllRooms(id).subscribe({
        next: (channel: IChannel) => {
          client.join(channel.id);
          client.to(channel.id).emit('room.join', {
            statusCode: 200,
            user_id: id,
            id: channel.id,
          });
          client.emit('room.join', {
            statusCode: 200,
            user_id: id,
            ...channel,
          });
        },
        error: (err) => {console.log(err)},
        complete: console.info,
      });
    }
    this.logger.log(`connected: ${client.id} auth: ${id}`);
  }

  handleDisconnect(client: Socket) {
    const id = client?.handshake?.auth?.token;
    this.logger.log(`connected: ${client.id} auth: ${id}`);
  }
}
