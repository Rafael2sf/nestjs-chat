import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import e from 'express';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { JoinChannelDto } from './dto/JoinChannel.dto';
import { Channel, ChannelUser } from './interfaces/chat.interfaces';
import { Message } from './interfaces/chat.interfaces';

@Injectable()
export class ChatService {
  /* Developnent only (testing) */
  private channels: Channel[] = [];
  private users: string[] = [];
  private messages: Message[] = [];
  private chat_user: ChannelUser[] = [];

  channelGetAll(): Channel[] {
    return this.channels;
  }

  createUser(id: string) {
    const user = this.users.find((x) => id === x);
    if (!user) this.users.push(id);
  }

  channelCreateOne(data: CreateChannelDto): string | undefined {
    const id = randomUUID();
    this.channels.push({ id, owner: data.user_id, name: data.name });
    return id;
  }

  channelJoinOne(data: JoinChannelDto): boolean {
    console.log(data);
    const channel = this.channels.find((x) => data.channel_id === x.id);
    if (!channel) {
      return false;
    }
    if (
      this.chat_user.find(
        (elem) =>
          elem.user_id === data.user_id && elem.channel_id === data.channel_id,
      )
    )
      throw new RpcException({
        statusCode: 400,
        message: 'Already subscribed to this channel.',
      });
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
