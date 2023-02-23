import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  name: string;
}
