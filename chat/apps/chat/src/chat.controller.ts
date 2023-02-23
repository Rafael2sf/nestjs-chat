import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { ChannelUser, Message } from './interfaces/chat.interfaces';

interface TCPResponse<T> {
  success: boolean;
  data?: T;
}

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  private readonly logger = new Logger(ChatController.name);

  @EventPattern('user.create')
  OnUserCreate(@Payload() data: string) {
    this.logger.log(`user.create: ${data}`);
    return this.chatService.createUser(data);
  }

  @MessagePattern('channel.create')
  OnChannelCreate(@Payload() data: CreateChannelDto): TCPResponse<string> {
    this.logger.log(`channel.create: ${JSON.stringify(data)}`);
    const channel_id = this.chatService.createChannel(data);
    const value = channel_id
      ? { success: true, data: channel_id }
      : { success: false };
    return value;
  }

  @MessagePattern('channel.join')
  OnChannelJoin(@Payload() data: ChannelUser): boolean {
    this.logger.log(`channel.join: ${JSON.stringify(data)}`);
    return this.chatService.joinChannel(data);
  }

  @MessagePattern('message.create')
  OnMessageCreate(@Payload() data: Message): boolean {
    this.logger.log(`message.create: ${JSON.stringify(data)}`);
    return this.chatService.createMessage(data);
  }
}
