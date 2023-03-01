import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { UserChannelDto } from './dto/UserChannel.dto';
import { IChannel } from './interfaces/chat.interfaces';
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
    this.chatService.channelLeaveOne(data);
    return true;
  }

  @MessagePattern('room.join')
  OnRoomJoin(@Payload() data: UserChannelDto): boolean {
    this.logger.log(`room.join: ${JSON.stringify(data)}`);
    this.chatService.roomJoinOne(data);
    return true;
  }

  @MessagePattern('message.get')
  OnMessageGet(@Payload() data: UserChannelDto): ISimplifiedMessage[] {
    this.logger.log(`message.get: ${JSON.stringify(data)}`);
    return this.chatService.messageGetAll(data);
  }

  @MessagePattern('message.create')
  OnMessageCreate(@Payload() data: CreateMessageDto): boolean {
    this.logger.log(`message.create: ${JSON.stringify(data)}`);
    this.chatService.messageCreate(data);
    return true;
  }
}
