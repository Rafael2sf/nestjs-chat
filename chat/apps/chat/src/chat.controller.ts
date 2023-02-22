import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { ChatUser, Message } from './interfaces/chat.interfaces';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  private readonly logger = new Logger(ChatController.name);

  @EventPattern('user.create')
  OnUserCreate(@Payload() data: string) {
    this.logger.log(`user.create: ${data}`);
    return this.chatService.createUser(data);
  }

  @EventPattern('channel.create')
  OnChannelCreate(@Payload() data: string) {
    this.logger.log(`channel.create: ${data}`);
    return this.chatService.createChannel(data);
  }

  @MessagePattern('channel.join')
  OnChannelJoin(@Payload() data: ChatUser): boolean {
    this.logger.log(`channel.join: ${JSON.stringify(data)}`);
    return this.chatService.joinChannel(data);
  }

  @MessagePattern('message.create')
  OnMessageCreate(@Payload() data: Message): boolean {
    this.logger.log(`message.create: ${JSON.stringify(data)}`);
    return this.chatService.createMessage(data);
  }
}
