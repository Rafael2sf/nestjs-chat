import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {Observable} from 'rxjs';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { UserChannelDto } from './dto/UserChannel.dto';
import { IChannel, IMessage } from './interfaces/chat.interfaces';
import { ISimplifiedMessage } from './interfaces/IChannelMessages';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  private readonly logger = new Logger(ChatController.name);

  @MessagePattern('channel.get')
  getChannels(): IChannel[] {
    return this.chatService.channelGetAll();
  }

  @MessagePattern('channel.create')
  OnChannelCreate(@Payload() data: CreateChannelDto): string {
    this.logger.log(`channel.create: ${JSON.stringify(data)}`);
    return this.chatService.channelCreateOne(data);
  }

  @MessagePattern('channel.delete')
  OnChannelDelete(@Payload() data: UserChannelDto): boolean {
    this.logger.log(`channel.delete: ${JSON.stringify(data)}`);
    this.chatService.channelDeleteOne(data);
    return true;
  }

  @MessagePattern('channel.join')
  OnChannelJoin(@Payload() data: UserChannelDto): boolean {
    this.logger.log(`channel.join: ${JSON.stringify(data)}`);
    this.chatService.channelJoinOne(data);
    return true;
  }

  @MessagePattern('channel.leave')
  OnChannelLeave(@Payload() data: UserChannelDto): boolean {
    this.logger.log(`channel.leave: ${JSON.stringify(data)}`);
    return this.chatService.channelLeaveOne(data);
  }

  @MessagePattern('room.join')
  OnRoomJoin(@Payload() data: UserChannelDto): boolean | Observable<IChannel> {
    this.logger.log(`room.join: ${JSON.stringify(data)}`);
    if (typeof data === 'string') {
      return this.chatService.roomJoinMany(data);
    } else {
      this.chatService.roomJoinOne(data);
      return true;
    }
  }

  @MessagePattern('message.get')
  OnMessageGet(@Payload() data: UserChannelDto): IMessage[] {
    this.logger.log(`message.get: ${JSON.stringify(data)}`);
    return this.chatService.messageGetAll(data);
  }

  @EventPattern('message.create')
  OnMessageCreate(@Payload() data: CreateMessageDto): boolean {
    this.logger.log(`message.create: ${JSON.stringify(data)}`);
    this.chatService.messageCreate(data);
    return true;
  }
}
