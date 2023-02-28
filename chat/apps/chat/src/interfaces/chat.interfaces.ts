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
  user_id: string;
  channel_id: string;
  data: string;
}

