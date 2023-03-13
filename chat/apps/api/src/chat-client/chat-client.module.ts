import { ChatClientGateway } from './chat-client.gateway';
import {
  ClientProviderOptions,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { ChatClientService } from './chat-client.service';
import { ChatClientController } from './chat-client.controller';

const ChatClientOptions: ClientProviderOptions = {
  name: 'CHAT_SERVICE',
  transport: Transport.TCP,
  options: {
    // required for docker
    host: 'chat',
    port: 3001,
  },
};

@Module({
  imports: [ClientsModule.register([ChatClientOptions])],
  controllers: [ChatClientController],
  providers: [ChatClientGateway, ChatClientService],
})
export class ChatClientModule {}
