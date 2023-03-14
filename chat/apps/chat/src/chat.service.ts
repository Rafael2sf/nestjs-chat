import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { GetMessagesDto } from './dto/GetMessagesDto';
import { UserChannelDto } from './dto/UserChannel.dto';
import { UserChannelActionDto } from './dto/UserChannelAction.dto';
import {
  IChannel,
  IMessage,
  IChannelUser,
  IMutedUser,
  IChannelData,
  UserLevel,
  ChannelType,
  ISimplifiedMessage,
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
    let users: string[] = [];
    this.chat_user.map((elem) => {
      if (elem.channel_id == data.channel_id) users.push(elem.user_id);
    });
    if (!users.find((elem) => elem === data.user_id)) {
      throw new RpcException({
        statusCode: 403,
        message: 'Not a member of this channel',
      });
    }
    const members = users.length;
    users = users.splice(data.offset, data.limit);
    return { ...channel, users, members };
  }

  channelGetAll(): IChannel[] {
    return this.channels;
  }

  channelCreateOne(data: CreateChannelDto): string {
    const id = randomUUID();
    this.channels.push({
      id,
      owner: data.user_id,
      name: data.name,
      type: data.type as ChannelType,
    });
    this.chat_user.push({
      user_id: data.user_id,
      channel_id: id,
      permission: UserLevel.OWNER,
    });
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
    this.chat_user.filter((elem) => elem.channel_id !== data.channel_id);
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
    this.chat_user.push({
      ...data,
      permission: UserLevel.USER,
    });
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
  messageGetAll(data: GetMessagesDto): ISimplifiedMessage[] {
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
    const messages: ISimplifiedMessage[] = [];
    this.messages.map((elem) => {
      if (elem.channel_id === data.channel_id)
        messages.push({ id: elem.id, user_id: elem.user_id, data: elem.data });
    });
    messages.reverse();
    return messages.splice(data.offset, data.limit);
  }

  messageCreate(data: CreateMessageDto): string {
    const is_muted = this.mute_hist.find(
      (elem) =>
        elem.target_id === data.user_id && elem.channel_id === data.channel_id,
    );
    if (is_muted && is_muted.timestamp >= Date.now()) {
      throw new RpcException({ statusCode: 403, message: 'muted' });
    }
    const id = randomUUID();
    this.messages.push({ id, ...data });
    return id;
  }

  // mute
  muteOne(data: UserChannelActionDto) {
    const user = this.chat_user.find((elem) => elem.user_id === data.user_id);
    const target = this.chat_user.find((elem) => elem.user_id === data.target_id);
    if (
      Object.values(UserLevel).indexOf(user.permission) <=
      Object.values(UserLevel).indexOf(target.permission)
    ) {
      throw new RpcException({
        statusCode: 403,
        message: 'Not enought permission to mute this user',
      });
    }
    const is_muted = this.mute_hist.find(
      (elem) =>
        elem.target_id === data.target_id && elem.channel_id === data.channel_id,
    );
    if (is_muted) {
      const prev_user = this.chat_user.find(
        (elem) => elem.user_id === is_muted.user_id &&
          elem.channel_id === data.channel_id,
      );
      if (
        Object.values(UserLevel).indexOf(user.permission) <
        Object.values(UserLevel).indexOf(prev_user.permission)
      ) {
        throw new RpcException({
          statusCode: 403,
          message: 'User is already muted by a higher user',
        });
      }
      is_muted.timestamp = Date.now() + data.timestamp * 60_000;
    } else {
      this.mute_hist.push({
        user_id: data.user_id,
        target_id: data.target_id,
        channel_id: data.channel_id,
        timestamp: Date.now() + data.timestamp * 60_000,
      });
    }
  }

  unmuteOne(data: UserChannelActionDto) {
    const user = this.chat_user.find((elem) => elem.user_id === data.user_id);
    const target = this.chat_user.find((elem) => elem.user_id === data.target_id);
    if (
      Object.values(UserLevel).indexOf(user.permission) <=
      Object.values(UserLevel).indexOf(target.permission)
    ) {
      throw new RpcException({
        statusCode: 403,
        message: 'Not enought permission to unmute this user',
      });
    }
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
    const prev_user = this.chat_user.find(
      (elem) => elem.user_id === is_muted.user_id &&
        elem.channel_id === data.channel_id,
    );
    if (
      Object.values(UserLevel).indexOf(user.permission) <
      Object.values(UserLevel).indexOf(prev_user.permission)
    ) {
      throw new RpcException({
        statusCode: 403,
        message: 'User was muted by a higher user',
      });
    }
    this.mute_hist = this.mute_hist.filter(
      (elem) =>
        elem.target_id !== target.user_id || elem.channel_id !== data.channel_id,
    );
  }
}
