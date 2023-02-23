import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { UserMessage } from './chat.interfaces';

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

  createUser(id: string) {
    this.chatService.emit<string>('user.create', id);
  }

  //   createChannel(id: string) {
  //     this.chatService.emit<string>('channel.create', id);
  //   }

  async joinChannel(user_id: string, channel_id: string): Promise<boolean> {
    return lastValueFrom(
      this.chatService.send<boolean>('channel.join', { user_id, channel_id }),
    );
  }

  /* Source code */

  // Returns true either the user can send this message or not
  async createMessage(message: UserMessage): Promise<boolean> {
    return lastValueFrom(
      this.chatService.send<boolean>('message.create', message),
    );
  }

  /* v2 */

  // (success: boolean, data: {})

  async createChannel(user_id: string, chat_name: string): Promise<string> {
    const resp = await lastValueFrom(
      this.chatService.send<TCPResponse<string>>('channel.create', {
        user_id,
        chat_name,
      }),
    );
    if (!resp.success)
      throw new HttpException('failed to create channel', HttpStatus.FORBIDDEN);
    return resp.data;
  }
}
