import {Inject, Injectable} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {firstValueFrom} from 'rxjs';
import {IChannel} from './interfaces/IChannel';
import {ISimplifiedMessage} from './interfaces/IChannelMessages';
import {IUserMessage} from './interfaces/IUserMessage';

@Injectable()
export class ChatService {
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
  joinRoom(user_id: string, channel_id: string): Promise<boolean> {
    return firstValueFrom(
      this.chatService.send<boolean>('room.join', {
        user_id,
        channel_id,
      }),
    );
  }

  // Messages
  getMessages(user_id: string, channel_id: string): Promise<ISimplifiedMessage[]>
  {
    return firstValueFrom(
      this.chatService.send<ISimplifiedMessage[]>('message.get', {
        user_id,
        channel_id
      }),
    );
  }

  createMessage(message: IUserMessage): Promise<boolean> {
    return firstValueFrom(
      this.chatService.send<boolean>('message.create', message),
    );
  }
}
