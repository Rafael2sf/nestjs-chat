import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @EventPattern('message')
  OnMessage(@Payload() data: any, @Ctx() context: any) {
    console.log(context.args[0]);
    console.log(data);
    this.chatService.test();
  }
}
