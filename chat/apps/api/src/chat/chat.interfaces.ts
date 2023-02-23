export interface UserJoinChannel {
  code: number;
  user_id?: string;
  channel_id?: string;
  created?: boolean;
}

export interface UserMessage {
  user_id: string;
  channel_id: string;
  data: string;
}
