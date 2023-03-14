import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { GetMessagesDto } from './dto/GetMessagesDto';
import { UserChannelDto } from './dto/UserChannel.dto';
import { UserChannelActionDto } from './dto/UserChannelAction.dto';
import {
  IChannel,
  IChannelData,
  IMessage,
  ISimplifiedMessage,
} from './interfaces/chat.interfaces';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  private readonly logger = new Logger(ChatController.name);

  @MessagePattern('test')
  test(): Promise<boolean> {
    return this.chatService.test();
  }

  @MessagePattern('channel.all')
  getChannels(): IChannel[] {
    this.logger.log(`channel.all`);
    return this.chatService.channelGetAll();
  }

  @MessagePattern('channel.get')
  getChannel(@Payload() data: GetMessagesDto): IChannelData {
    this.logger.log(`channel.get: ${JSON.stringify(data)}`);
    return this.chatService.channelGetOne(data);
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
  OnRoomJoin(
    @Payload() data: UserChannelDto | string,
  ): Observable<IChannel> | IChannel {
    this.logger.log(`room.join: ${JSON.stringify(data)}`);
    if (typeof data === 'string') {
      return this.chatService.roomJoinMany(data);
    } else {
      return this.chatService.roomJoinOne(data);
    }
  }

  @MessagePattern('message.get')
  OnMessageGet(@Payload() data: GetMessagesDto): ISimplifiedMessage[] {
    this.logger.log(`message.get: ${JSON.stringify(data)}`);
    return this.chatService.messageGetAll(data);
  }

  @MessagePattern('message.create')
  OnMessageCreate(@Payload() data: CreateMessageDto): string {
    this.logger.log(`message.create: ${JSON.stringify(data)}`);
    return this.chatService.messageCreate(data);
  }

  @MessagePattern('channel.mute')
  OnChannelMute(@Payload() data: UserChannelActionDto): boolean {
    this.logger.log(`channel.mute: ${JSON.stringify(data)}`);
    this.chatService.muteOne(data);
    return true;
  }

  @MessagePattern('channel.unmute')
  OnChannelUnmute(@Payload() data: UserChannelActionDto): boolean {
    this.logger.log(`channel.unmute: ${JSON.stringify(data)}`);
    this.chatService.unmuteOne(data);
    return true;
  }
}
