import { IsAlphanumeric, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
}

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(ChannelType)
  type: string;
}
