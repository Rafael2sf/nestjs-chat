import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { GetMessagesDto } from './dto/GetMessagesDto';
import { UserChannelDto } from './dto/UserChannel.dto';
import {
  IChannel,
  IMessage,
  IChannelUser,
  IMutedUser,
  IChannelData,
} from './interfaces/chat.interfaces';

@Injectable()
export class ChatService {
  private channels: IChannel[] = [];
  private messages: IMessage[] = [];
  private chat_user: IChannelUser[] = [];
  private mute_hist: IMutedUser[] = [];

  test(): Promise<boolean> {
    //throw new RpcException({ statusCode: 403 });
    return new Promise((res) => setTimeout(() => res(true), 2000));
  }

  channelGetOne(data: GetMessagesDto): IChannelData {
    const channel = this.channels.find((elem) => elem.id === data.channel_id);
    if (!channel) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid channel_id',
      });
    }
    let members: string[] = [];
    this.chat_user.map((elem) => {
      if (elem.channel_id == data.channel_id) members.push(elem.user_id);
    });
    if (!members.find((elem) => elem === data.user_id)) {
      throw new RpcException({
        statusCode: 403,
        message: 'Not a member of this channel',
      });
    }
    members = members.splice(data.offset, data.limit);
    return { ...channel, members };
  }

  channelGetAll(): IChannel[] {
    return this.channels;
  }

  channelCreateOne(data: CreateChannelDto): string | undefined {
    const id = randomUUID();
    this.channels.push({
      id,
      owner: data.user_id,
      name: data.name,
      type: 'public',
    });
    this.chat_user.push({ user_id: data.user_id, channel_id: id });
    return id;
  }

  channelDeleteOne(data: UserChannelDto) {
    const filered_channels = this.channels.filter(
      (elem) => elem.owner !== data.user_id || elem.id !== data.channel_id,
    );
    if (filered_channels.length === this.channels.length)
      throw new RpcException({
        statusCode: 403,
        message: 'Not enough permissions to delete this channel',
      });
    this.channels = filered_channels;
  }

  channelJoinOne(data: UserChannelDto) {
    const channel = this.channels.find((elem) => elem.id === data.channel_id);
    if (!channel) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid channel_id',
      });
    }
    if (
      channel.owner === data.user_id ||
      this.chat_user.find(
        (elem) =>
          elem.user_id === data.user_id && elem.channel_id === data.channel_id,
      )
    ) {
      throw new RpcException({
        statusCode: 400,
        message: 'Already joined this channel',
      });
    }
    this.chat_user.push(data);
  }

  // returns true either the user is the owner of channel or not
  channelLeaveOne(data: UserChannelDto): boolean {
    const channel = this.channels.find((elem) => elem.id === data.channel_id);
    if (!channel)
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid channel_id',
      });
    // If user is owner and leaves channel => delete channel
    if (channel.owner === data.user_id) {
      this.channels = this.channels.filter(
        (elem) => elem.id !== data.channel_id,
      );
      this.chat_user = this.chat_user.filter(
        (elem) => elem.channel_id !== data.channel_id,
      );
      console.log('is owner');
      return true;
    } else {
      const filtered_chat_user = this.chat_user.filter(
        (elem) =>
          elem.user_id !== data.user_id || elem.channel_id !== data.channel_id,
      );
      if (filtered_chat_user.length === this.chat_user.length)
        throw new RpcException({
          statusCode: 403,
          message: 'Not a member of this channel',
        });
      this.chat_user = filtered_chat_user;
      console.log('is not owner');
      return false;
    }
  }

  // Rooms

  roomJoinOne(data: UserChannelDto): IChannel {
    const channel = this.channels.find((elem) => elem.id === data.channel_id);
    if (!channel) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid channel_id',
      });
    }
    const chat_user = this.chat_user.find(
      (elem) =>
        elem.user_id === data.user_id && elem.channel_id === data.channel_id,
    );
    if (!chat_user) {
      throw new RpcException({
        statusCode: 403,
        message: 'Not a member of this channel',
      });
    }
    return channel;
  }

  roomJoinMany(data: string): Observable<IChannel> {
    const filtered_chat_user = this.chat_user.filter(
      (elem) => elem.user_id === data,
    );
    const filtered_channels = this.channels.filter((elem) =>
      filtered_chat_user.find((x) => elem.id === x.channel_id),
    );
    if (!filtered_channels) {
      throw new RpcException({
        statusCode: 400,
        message: 'No channels',
      });
    }
    return new Observable((subscriber) => {
      filtered_channels.map((elem) => subscriber.next(elem));
      subscriber.complete();
    });
  }

  // Messages
  messageGetAll(data: GetMessagesDto): IMessage[] {
    if (
      !this.chat_user.find(
        (elem) =>
          elem.channel_id === data.channel_id && elem.user_id === data.user_id,
      )
    ) {
      throw new RpcException({
        statusCode: 403,
        message: 'Not a member of this channel',
      });
    }
    const filtered_messages: IMessage[] = this.messages.filter(
      (elem) => elem.channel_id === data.channel_id,
    );
    filtered_messages.reverse();
    return filtered_messages.splice(data.offset, data.limit);
  }

  messageCreate(data: CreateMessageDto): string {
    const is_muted = this.mute_hist.find(
      (elem) =>
        elem.user_id === data.user_id && elem.channel_id === data.channel_id,
    );
    if (is_muted && is_muted.timestamp >= Date.now()) {
      throw new RpcException({ statusCode: 403, message: 'muted' });
    }
    const id = randomUUID();
    this.messages.push({ id, ...data });
    return id;
  }

  // mute
  muteOne(data: IMutedUser) {
    const is_muted = this.mute_hist.find(
      (elem) =>
        elem.user_id === data.user_id && elem.channel_id === data.channel_id,
    );
    if (is_muted) is_muted.timestamp = Date.now() + data.timestamp * 60_000;
    else {
      this.mute_hist.push({
        user_id: data.user_id,
        channel_id: data.channel_id,
        timestamp: Date.now() + data.timestamp * 60_000,
      });
    }
  }

  unmuteOne(data: IMutedUser) {
    const is_muted = this.mute_hist.find(
      (elem) =>
        elem.user_id === data.user_id && elem.channel_id === data.channel_id,
    );
    if (!is_muted || is_muted.timestamp < Date.now()) {
      throw new RpcException({
        statusCode: 400,
        message: 'Target user is not muted',
      });
    }
    this.mute_hist = this.mute_hist.filter(
      (elem) =>
        elem.user_id !== data.user_id || elem.channel_id !== data.channel_id,
    );
  }
}
