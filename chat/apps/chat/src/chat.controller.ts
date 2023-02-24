import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { JoinChannelDto } from './dto/JoinChannel.dto';
import { IChannel, IMessage } from './interfaces/chat.interfaces';

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

  @MessagePattern('channel.join')
  OnChannelJoin(@Payload() data: JoinChannelDto): boolean {
    this.logger.log(`channel.join: ${JSON.stringify(data)}`);
    this.chatService.channelJoinOne(data);
    return true;
  }

  @MessagePattern('room.join')
  OnRoomJoin(@Payload() data: JoinChannelDto): boolean {
    this.logger.log(`room.join: ${JSON.stringify(data)}`);
    this.chatService.roomJoinOne(data);
    return true;
  }

  @MessagePattern('message.create')
  OnMessageCreate(@Payload() data: IMessage): boolean {
    this.logger.log(`message.create: ${JSON.stringify(data)}`);
    this.chatService.createMessage(data);
    return true;
  }
}
