import {Injectable} from '@nestjs/common';
import {RpcException} from '@nestjs/microservices';
import {randomUUID} from 'crypto';
import {CreateChannelDto} from './dto/CreateChannel.dto';
import {CreateMessageDto} from './dto/CreateMessage.dto';
import {UserChannelDto} from './dto/UserChannel.dto';
import {IChannel, IMessage, IChannelUser} from './interfaces/chat.interfaces';
import {ISimplifiedMessage} from './interfaces/IChannelMessages';

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
    this.channels.push({id, owner: data.user_id, name: data.name});
    this.chat_user.push({user_id: data.user_id, channel_id: id});
    return id;
  }

  channelDeleteOne(data: UserChannelDto) {
    const filered_channels =
      this.channels.filter((elem) => elem.owner !== data.user_id
        || (elem.owner === data.user_id) && elem.id !== data.channel_id)
    if (filered_channels.length === this.channels.length)
      throw new RpcException({statusCode: 403, message: 'Not enough permissions to delete this channel'})
    console.log(filered_channels);
    this.channels = filered_channels;
  }

  channelJoinOne(data: UserChannelDto) {
    const channel = this.channels.find((elem) => elem.id === data.channel_id)
    if (!channel) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid channel_id',
      });
    }
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

  channelLeaveOne(data: UserChannelDto) {
    const channel = this.channels.find((elem) =>
      elem.id === data.channel_id)
    if (!channel)
      throw new RpcException({statusCode: 400, message: 'Invalid channel_id'})
    // If user is owner and leaves channel => delete channel
    if (channel.owner === data.user_id) {
      this.channels = this.channels.filter((elem) => elem.id !== data.channel_id)
      this.chat_user = this.chat_user.filter((elem) => elem.channel_id !== data.channel_id)
    }
    else {
      const filtered_chat_user = this.chat_user.filter((elem) => elem.user_id !== data.user_id && elem.channel_id !== data.channel_id)
      if (filtered_chat_user.length === this.chat_user.length)
        throw new RpcException({statusCode: 403, message: 'Not a member of this channel'})
      this.chat_user = filtered_chat_user;
    }
  }

  // Rooms

  roomJoinOne(data: UserChannelDto) {
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
  messageGetAll(data: UserChannelDto): ISimplifiedMessage[] {
    const chat_user = this.chat_user.find((elem) => elem.channel_id === data.channel_id)
    if (!chat_user) {
      throw new RpcException({
        statusCode: 403,
        message: 'Not a member of this channel',
      });
    }
    const messages: IMessage[] = this.messages.filter((elem) => elem.channel_id === data.channel_id);
    messages.map((elem) => delete elem.channel_id)
    return messages;
  }

  messageCreate(data: CreateMessageDto) {
    const chat_user = this.chat_user.find(
      (elem) => elem.channel_id === data.channel_id && elem.user_id === elem.user_id,
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
