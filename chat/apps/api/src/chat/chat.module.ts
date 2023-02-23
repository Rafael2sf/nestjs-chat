import { ChatGateway } from './chat.gateway';
import {
  ClientProviderOptions,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

const ChatClientOptions: ClientProviderOptions = {
  name: 'CHAT_SERVICE',
  transport: Transport.TCP,
  options: {
    port: 3001,
  },
};

@Module({
  imports: [ClientsModule.register([ChatClientOptions])],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
