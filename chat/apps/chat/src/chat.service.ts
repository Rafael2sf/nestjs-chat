import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { JoinChannelDto } from './dto/JoinChannel.dto';
import { IChannel, IMessage, IChannelUser } from './interfaces/chat.interfaces';

@Injectable()
export class ChatService {
  private channels: IChannel[] = [];
  private messages: IMessage[] = [];
  private chat_user: IChannelUser[] = [];

  // Channels

  channelGetAll(): IChannel[] {
    return this.channels;
  }

  channelCreateOne(data: CreateChannelDto): string | undefined {
    const id = randomUUID();
    this.channels.push({ id, owner: data.user_id, name: data.name });
    this.chat_user.push({ user_id: data.user_id, channel_id: id });
    return id;
  }

  channelJoinOne(data: JoinChannelDto) {
    if (
      this.chat_user.find(
        (elem) =>
          elem.user_id === data.user_id && elem.channel_id === data.channel_id,
      )
    )
      throw new RpcException({
        statusCode: 400,
        message: 'Already joined this channel',
      });
    this.chat_user.push(data);
  }

  // Rooms

  roomJoinOne(data: JoinChannelDto) {
    if (
      !this.chat_user.find(
        (elem) =>
          elem.user_id === data.user_id && elem.channel_id === data.channel_id,
      )
    ) {
      throw new RpcException({
        statusCode: 403,
        message: 'Not a member of this channel',
      });
    }
  }

  // Messages

  createMessage(data: IMessage) {
    const chat_user = this.chat_user.find(
      (e) => e.channel_id == data.channel_id && e.user_id == e.user_id,
    );
    if (!chat_user) {
      throw new RpcException({
        statusCode: 403,
        message: 'Not a member of this channel',
      });
    }
    this.messages.push(data);
  }
}
