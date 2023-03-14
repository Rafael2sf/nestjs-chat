export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
}

export enum UserLevel {
  USER = 'user',
  ADMIN = 'admin',
  OWNER = 'owner'
}

export interface IChannel {
  id: string;
  owner: string;
  name: string;
  type: ChannelType;
}

export interface IChannelUser {
  user_id: string;
  channel_id: string;
  permission: UserLevel;
}

export interface ISimplifiedChannelUser {
  user_id: string;
  permission: UserLevel;
}

export interface IChannelData extends IChannel {
  users: string[];
  members: number;
}

export interface IMessage {
  id: string;
  user_id: string;
  channel_id: string;
  data: string;
}

export class ISimplifiedMessage {
  id: string;
  user_id: string;
  data: string;
}

export interface IMutedUser {
  user_id: string;
  target_id: string;
  channel_id: string;
  timestamp: number;
}
