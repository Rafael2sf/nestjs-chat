// export interface UserJoinChannel {
//   code: number;
//   user_id?: string;
//   channel_id?: string;
//   created?: boolean;
// }

export interface ChatUser {
  user_id: string;
  channel_id: string;
}

export interface Message {
  user_id: string;
  channel_id: string;
  data: string;
}
