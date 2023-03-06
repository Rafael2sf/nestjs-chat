export interface IChannel {
  id: string;
  owner: string;
  name: string;
}

export interface IChannelUser {
  user_id: string;
  channel_id: string;
}

export interface IMessage {
  id: string;
  user_id: string;
  channel_id: string;
  data: string;
}

export interface IMutedUser {
  user_id: string;
  channel_id: string;
  timestamp: number;
}
