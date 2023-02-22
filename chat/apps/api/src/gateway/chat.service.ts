import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { UserMessage } from './chat.interfaces';

@Injectable()
export class ChatService {
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
  ) {}
  /* Development ONLY (testing) */

  createUser(id: string) {
    this.chatService.emit<string>('user.create', id);
  }

  createChannel(id: string) {
    this.chatService.emit<string>('channel.create', id);
  }

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
}
