import { ChatGateway } from './chat.gateway';
import { forwardRef, Module } from '@nestjs/common';
import { ApiModule } from '../api.module';
import { ApiService } from '../api.service';

@Module({
  imports: [forwardRef(() => ApiModule)],
  controllers: [],
  providers: [ChatGateway, ApiService],
})
export class ChatModule {}
