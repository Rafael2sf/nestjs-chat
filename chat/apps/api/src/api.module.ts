import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ApiModule {}
