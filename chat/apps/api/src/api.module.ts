import { Module } from '@nestjs/common';
import { ChatClientModule } from './chat-client/chat-client.module';

@Module({
  imports: [ChatClientModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ApiModule {}
