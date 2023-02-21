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
import { Server } from 'ws';
import { ApiService } from '../api.service';

@WebSocketGateway({ path: '/chat', serveClient: false, cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ApiService) {}
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message.create')
  OnMessage(@Payload() data: any, @ConnectedSocket() client: any) {
    this.chatService.test();
  }

  handleConnection(client: any) {
    //console.log(client);
    console.log('connected');
  }

  handleDisconnect(client: any) {
    console.log('disconnect');
  }
}
