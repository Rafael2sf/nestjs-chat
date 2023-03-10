import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { CreateMuteDto } from './dto/CreateMute.dto';
import { GetMessagesDto } from './dto/GetMessagesDto';
import { IChannel, IChannelData } from './interfaces/IChannel';
import { ISimplifiedMessage } from './interfaces/IChannelMessages';
import { IMessage } from './interfaces/IUserMessage';

@Injectable()
export class ChatClientService {
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
  ) {}

  test(): Promise<void> {
    return firstValueFrom(this.chatService.send<void>('test', {}));
  }

  // Channels

  getChannel(data: GetMessagesDto): Promise<IChannelData> {
    return firstValueFrom(
      this.chatService.send<IChannelData>('channel.get', data),
    );
  }

  getChannels(): Promise<IChannel[]> {
    return firstValueFrom(this.chatService.send<IChannel[]>('channel.all', {}));
  }

  async createChannel(user_id: string, name: string): Promise<{ id: string }> {
    const id = await firstValueFrom(
      this.chatService.send<string>('channel.create', {
        user_id,
        name,
      }),
    );
    return { id };
  }

  async deleteChannel(user_id: string, channel_id: string): Promise<void> {
    await firstValueFrom(
      this.chatService.send<void>('channel.delete', {
        user_id,
        channel_id,
      }),
    );
  }

  async joinChannel(user_id: string, channel_id: string): Promise<void> {
    await firstValueFrom(
      this.chatService.send<void>('channel.join', {
        user_id,
        channel_id,
      }),
    );
  }

  leaveChannel(user_id: string, channel_id: string): Promise<boolean> {
    return firstValueFrom(
      this.chatService.send<boolean>('channel.leave', {
        user_id,
        channel_id,
      }),
    );
  }

  // Rooms
  joinRoom(user_id: string, channel_id: string): Promise<IChannel> {
    return firstValueFrom(
      this.chatService.send<IChannel>('room.join', {
        user_id,
        channel_id,
      }),
    );
  }

  // No error handler
  joinAllRooms(user_id: string): Observable<IChannel> {
    return this.chatService.send<IChannel>('room.join', user_id);
  }

  // Messages
  async getMessages(data: GetMessagesDto): Promise<ISimplifiedMessage[]> {
    const messages = await firstValueFrom(
      this.chatService.send<IMessage[]>('message.get', data),
    );
    messages.filter((elem) => delete elem.channel_id);
    return messages;
  }

  createMessage(message: IMessage): Promise<string> {
    return firstValueFrom(
      this.chatService.send<string>('message.create', message),
    );
  }

  // mute
  async muteUser(user: string, data: CreateMuteDto): Promise<void> {
    await firstValueFrom(this.chatService.send<void>('channel.mute', data));
  }

  async unmuteUser(user: string, data: CreateMuteDto): Promise<void> {
    await firstValueFrom(this.chatService.send<void>('channel.unmute', data));
  }
}
