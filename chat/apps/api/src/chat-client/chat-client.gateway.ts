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

@Injectable()
@WebSocketGateway({ path: '/chat', serveClient: false, cors: { origin: '*' } })
export class ChatClientGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatClientGateway.name);
  constructor(private readonly chatService: ChatClientService) {}
  @WebSocketServer()
  server: Server;

  async forceRoomLeave(user_id: string, channel_id: string) {
    /*this.server.sockets.adapter.nsp.sockets.forEach((x: Socket) => {
      if (x.handshake.auth.token === user_id) {
        x.leave(channel_id);
      }
    });*/
    const sockets = await this.server.in(channel_id).fetchSockets();
    for (const socket of sockets) {
      console.log(socket);
      if (socket?.handshake?.auth?.token === user_id) {
        socket.leave(channel_id);
      }
    }
  }

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
        .then(() => {
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

  /*
 * 1.Should user receive all messages when connected or just the chat he opens ?
  [ -> enters] -> [GET /channels] -> [room.join ['123', '321', '456']]
                    -- dont --    -> [room.joinAll[   internal get for all channels ] -> return all channels

   2. Should client subscribe to channel with http and then join room with ws or all on ws?
   [-> enters] -> [POST /channels/:id] -> [ws room.join id]
   [-> enters] ->       -- ignore --   -> [ws channel.join id] -> [internal room join]
*/

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

  @SubscribeMessage('message.writing')
  OnMessageWriting(@Payload() data: string, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (client.rooms.has(data)) {
      client.to(data).emit('message.writing', {
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
      client.to(data).emit('message.notwriting', {
        user_id: id,
        channel_id: data,
      });
    }
  }

  @SubscribeMessage('message.create')
  OnMessageCreate(@Payload() data: any, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (client.rooms.has(data.channel_id)) {
      this.chatService.createMessage({
        user_id: id,
        channel_id: data.channel_id,
        data: data.data,
      });
      client.to(data.channel_id).emit('message.create', {
        statusCode: 200,
        user_id: id,
        channel_id: data.channel_id,
        data: data.data,
      });
      client.emit('message.create', {
        statusCode: 200,
        user_id: id,
        channel_id: data.channel_id,
        data: data.data,
      });
    } else {
      client.emit('message.create', {
        statusCode: 400,
        message: 'Not a member of this room',
      });
    }
  }

  handleConnection(client: Socket) {
    const id = client?.handshake?.auth?.token;
    this.logger.log(`connected: ${client.id} auth: ${id}`);
  }

  handleDisconnect(client: Socket) {
    const id = client?.handshake?.auth?.token;
    this.logger.log(`connected: ${client.id} auth: ${id}`);
  }
}

// room.join {user_id, channel_id}
// room.leave {user_id, channel_id}
// message.typing {user_id}
// message.create {user_id, channel_id, data}
// message.update ?
// message.delete ?
