import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom, Observable, takeUntil } from 'rxjs';
import {CreateMuteDto} from './dto/CreateMute.dto';
import {GetMessagesDto} from './dto/GetMessagesDto';
import { IChannel } from './interfaces/IChannel';
import { ISimplifiedMessage } from './interfaces/IChannelMessages';
import { IMessage } from './interfaces/IUserMessage';

@Injectable()
export class ChatClientService {
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
  ) {}

  // Channels
  getChannels(): Promise<IChannel[]> {
    return firstValueFrom(this.chatService.send<IChannel[]>('channel.get', {}));
  }

  createChannel(user_id: string, name: string): Promise<string> {
    return firstValueFrom(
      this.chatService.send<string>('channel.create', {
        user_id,
        name,
      }),
    );
  }

  deleteChannel(user_id: string, channel_id: string): Promise<string> {
    return firstValueFrom(
      this.chatService.send<string>('channel.delete', {
        user_id,
        channel_id,
      }),
    );
  }

  joinChannel(user_id: string, channel_id: string): Promise<boolean> {
    return firstValueFrom(
      this.chatService.send<boolean>('channel.join', {
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

  joinAllRooms(user_id: string): Observable<IChannel> {
    try {
      return this.chatService.send<IChannel>('room.join', user_id);
    } catch (e) {
      console.log('join all rooms catch', e);
    }
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
    return firstValueFrom(this.chatService.send<string>('message.create', message));
  }

  // mute
  muteUser(user: string, data: CreateMuteDto): Promise<boolean> {
    console.log(data.timestamp);
    return firstValueFrom(this.chatService.send<boolean>('channel.mute', data));
  }

  unmuteUser(user: string, data: CreateMuteDto): Promise<boolean> {
    return firstValueFrom(
      this.chatService.send<boolean>('channel.unmute', data));
  }
}
