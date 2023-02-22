import { Injectable } from '@nestjs/common';
import e from 'express';
import { ChatUser } from './interfaces/chat.interfaces';
import { Message } from './interfaces/chat.interfaces';

@Injectable()
export class ChatService {
  /* Developnent only (testing) */
  private channels: string[] = [];
  private users: string[] = [];
  private messages: Message[] = [];
  private chat_user: ChatUser[] = [];

  createUser(id: string) {
    const user = this.users.find((x) => id === x);
    if (!user) this.users.push(id);
  }

  createChannel(id: string) {
    const channel = this.channels.find((x) => id === x);
    if (!channel) this.channels.push(id);
  }

  joinChannel(data: ChatUser): boolean {
    const channel = this.channels.find((x) => data.channel_id === x);
    if (!channel) {
      return false;
    }
    if (
      !this.chat_user.find(
        (elem) =>
          elem.user_id === data.user_id && elem.channel_id === data.channel_id,
      )
    )
      this.chat_user.push(data);
    return true;
  }

  /* Source code */

  createMessage(data: Message): boolean {
    const chat_user = this.chat_user.find(
      (e) => e.channel_id == data.channel_id && e.user_id == e.user_id,
    );
    if (chat_user) {
      this.messages.push(data);
      return true;
    }
    return false;
  }
}
