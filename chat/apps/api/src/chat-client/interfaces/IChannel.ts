export interface IChannel {
  id: string;
  owner: string;
  name: string;
  type: string;
}

export interface IChannelData extends IChannel {
  users: string[];
  members: number;
}
