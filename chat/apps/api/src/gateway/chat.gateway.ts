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
import { UserMessage } from './chat.interfaces';
import { ChatService } from './chat.service';

@WebSocketGateway({ path: '/chat', serveClient: false, cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  constructor(private readonly chatService: ChatService) {}
  @WebSocketServer()
  server: Server;

  /* Development ONLY (testing) */

  // User created channel
  // { id: channel_id } => { code: 200/400 }
  @SubscribeMessage('channel.create')
  OnChannelCreate(@Payload() data: any, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (id && data && typeof data == 'string') {
      this.logger.log(
        `channel.create: ${client.id}, user: ${id}, channel_id: ${data}`,
      );
      this.chatService.createChannel(data);
      client.join(data);
      client.emit('channel.join', {
        code: 200,
        channel_id: data,
        created: true,
      });
    } else {
      client.emit('channel.join', {
        code: 400,
      });
    }
  }

  // user join channel
  // [userid, channelid] => [ code: 200/400]
  @SubscribeMessage('channel.join')
  async OnChannelJoin(@Payload() data: any, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (id) {
      const joined = await this.chatService.joinChannel(id, data);
      if (joined) {
        this.logger.log(
          `channel.join: ${client.id}, user: ${id}, channel_id: ${data}`,
        );
        client.join(data);
        client.emit('channel.join', {
          code: 200,
          channel_id: data,
          created: false,
        });
        return;
      }
    }
    client.emit('channel.join', {
      code: 400,
    });
  }

  /* source code */

  @SubscribeMessage('message.create')
  OnMessage(@Payload() data: UserMessage, @ConnectedSocket() client: Socket) {
    const id = client?.handshake?.auth?.token;
    if (
      this.chatService.createMessage({
        user_id: id,
        channel_id: data.channel_id,
        data: data.data,
      })
    ) {
      this.logger.log(
        `message.create: ${client.id}, user_id: ${id}, channel_id: ${data.channel_id}, data: ${data.data}`,
      );
      client.to(data.channel_id).emit('message.create', {
        user_id: id,
        channel_id: data.channel_id,
        data: data.data,
      });
      return 'test';
    }
  }

  // User auto-generated code will be sent on connection, no return
  handleConnection(client: Socket) {
    const id = client?.handshake?.auth?.token;
    this.logger.log(`connected: ${client.id} auth: ${id}`);
    if (!id || typeof id != 'string') {
      client.emit('error', 'invalid auth');
    } else this.chatService.createUser(id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`disconnect: ${client.id}`);
  }
}
