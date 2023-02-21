import { DynamicModule, Module } from '@nestjs/common';
import { ApiService } from './api.service';
// import { ChatClient } from './clients/Clients';
import { ApiController } from './api.controller';
import { ChatModule } from './gateway/chat.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

const ChatClientOptions = {
    name: 'CHAT_SERVICE',
    transport: Transport.TCP,
    options: {
    port: 3001,
    }
}
 
@Module({
  imports: [
    ClientsModule.register([ChatClientOptions]),
    ChatModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
  exports: [
    ClientsModule.register([
      {
        name: 'CHAT_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 3001,
        },
      },
    ]),
    // {
    //   name: 'CHAT_SERVICE',
    //   useFactory: (): DynamicModule => {
    // 	return ClientsModule.register([
    // 		{
    // 			name: 'CHAT_SERVICE',
    // 			transport: Transport.TCP,
    // 			options: {
    // 				port: 3001,
    // 			},
    // 		}
    // 	]),,
    //   },
    // },
  ],
})
export class ApiModule {}
