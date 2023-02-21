import { Injectable } from '@nestjs/common';
import { ChatUser } from './interfaces/ChatUser';
import { Message } from './interfaces/Message';

@Injectable()
export class ChatService {
  private channels: string[] = [];
  private users: string[] = [];
  private messages: Message[];
  private chat_user: ChatUser[];

  test() {
    console.log('message received');
  }
}
