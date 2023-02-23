import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { UserMessage } from './chat.interfaces';
import { Channel } from './interfaces/Channel.dto';
import { UserChannel } from './interfaces/UserChannel.interface';

interface TCPResponse<T> {
  success: boolean;
  data?: T;
}

@Injectable()
export class ChatService {
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
  ) {}
  /* Development ONLY (testing) */

  //   createChannel(id: string) {
  //     this.chatService.emit<string>('channel.create', id);
  //   }
  /* Source code */

  // Returns true either the user can send this message or not
  async createMessage(message: UserMessage): Promise<boolean> {
    return lastValueFrom(
      this.chatService.send<boolean>('message.create', message),
    );
  }

  /* v2 */

  async getChannels(): Promise<Channel[]> {
    const res = await lastValueFrom(
      this.chatService.send<TCPResponse<Channel[]>>('channel.get', {}),
    );
    if (!res.success)
      throw new HttpException('failed to get channels', HttpStatus.FORBIDDEN);
    return res.data;
  }

  async createChannel(user_id: string, name: string): Promise<string> {
    const res = await lastValueFrom(
      this.chatService.send<TCPResponse<string>>('channel.create', {
        user_id,
        name,
      }),
    );
    if (!res.success) return res.data;
  }

  async joinChannel(user_id: string, channel_id: string): Promise<boolean> {
    const res = await lastValueFrom(
      this.chatService.send<TCPResponse<UserChannel>>('channel.join', {
        user_id,
        channel_id,
      }),
    );
    return res.success;
  }
}
