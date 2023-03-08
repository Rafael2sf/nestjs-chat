export interface IChannel {
  id: string;
  owner: string;
  name: string;
  type: string;
}

export interface IChannelData extends IChannel {
  members: string[];
}
