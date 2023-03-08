export interface IChannel {
  id: string;
  owner: string;
  name: string;
  type: string;
}

export interface IChannelUser {
  user_id: string;
  channel_id: string;
}

export interface IChannelData extends IChannel {
  members: string[];
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
