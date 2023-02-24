import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { IChannel } from './interfaces/IChannel';
import { IUserMessage } from './interfaces/IUserMessage';

@Injectable()
export class ChatService {
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
  ) {}

  // Channels
  async getChannels(): Promise<IChannel[]> {
    return lastValueFrom(this.chatService.send<IChannel[]>('channel.get', {}));
  }

  async createChannel(user_id: string, name: string): Promise<string> {
    return lastValueFrom(
      this.chatService.send<string>('channel.create', {
        user_id,
        name,
      }),
    );
  }

  async joinChannel(user_id: string, channel_id: string): Promise<boolean> {
    return await lastValueFrom(
      this.chatService.send<boolean>('channel.join', {
        user_id,
        channel_id,
      }),
    );
  }

  // Rooms
  async joinRoom(user_id: string, channel_id: string): Promise<boolean> {
    return await lastValueFrom(
      this.chatService.send<boolean>('room.join', {
        user_id,
        channel_id,
      }),
    );
  }

  // Messages
  async createMessage(message: IUserMessage): Promise<boolean> {
    return lastValueFrom(
      this.chatService.send<boolean>('message.create', message),
    );
  }
}
