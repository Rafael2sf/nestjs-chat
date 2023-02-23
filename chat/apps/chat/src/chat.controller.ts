import { Controller, Logger } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { JoinChannelDto } from './dto/JoinChannel.dto';
import { Channel, ChannelUser, Message } from './interfaces/chat.interfaces';

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

  @MessagePattern('channel.get')
  getChannels(): TCPResponse<Channel[]> {
    const channels = this.chatService.channelGetAll();
    console.log(channels);
    const value = channels
      ? { success: true, data: channels }
      : { success: false };
    return value;
  }

  @MessagePattern('channel.create')
  OnChannelCreate(@Payload() data: CreateChannelDto): TCPResponse<string> {
    throw new RpcException({ statusCode: 403, message: 'invalid something' });
    this.logger.log(`channel.create: ${JSON.stringify(data)}`);
    const channel_id = this.chatService.channelCreateOne(data);
    const value = channel_id
      ? { success: true, data: channel_id }
      : { success: false };
    return value;
  }

  @MessagePattern('channel.join')
  OnChannelJoin(@Payload() data: JoinChannelDto): TCPResponse<undefined> {
    this.logger.log(`channel.join: ${JSON.stringify(data)}`);
    const success = this.chatService.channelJoinOne(data);
    return { success };
  }

  @MessagePattern('message.create')
  OnMessageCreate(@Payload() data: Message): boolean {
    this.logger.log(`message.create: ${JSON.stringify(data)}`);
    return this.chatService.createMessage(data);
  }
}
