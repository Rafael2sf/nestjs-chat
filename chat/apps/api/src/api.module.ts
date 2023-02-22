import { Module } from '@nestjs/common';
import { ChatModule } from './gateway/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ApiModule {}
