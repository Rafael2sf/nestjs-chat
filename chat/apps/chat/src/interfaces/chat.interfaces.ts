// export interface UserJoinChannel {
//   code: number;
//   user_id?: string;
//   channel_id?: string;
//   created?: boolean;
// }

export interface Channel {
  id: string;
  owner: string;
  name: string;
}

export interface ChannelUser {
  user_id: string;
  channel_id: string;
}

export interface Message {
  user_id: string;
  channel_id: string;
  data: string;
}
