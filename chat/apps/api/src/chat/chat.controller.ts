import {
  Body,
  Controller,
  Delete,
  Headers,
  Logger,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/CreateChannel.dto';

@Controller('/')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  private readonly logger = new Logger(ChatController.name);

  /**
   *
   * @Brief User $jwt creates a channel with the provided name
   * @param jwt authorization token
   * @param name provide the channel name in body as json
   * @return channel_id
   */
  @Post('/channels/')
  CreateChannel(
    @Headers('authorization') jwt,
    @Body() body: CreateChannelDto,
  ): any {
    this.logger.log(`POST '/channels/' from ${jwt}: chat_name => ${body.name}`);
    return this.chatService
      .createChannel(jwt.split(' ')[1], body.name)
      .then((value) => value)
      .catch((err) => err);
  }

  /**
   *
   * @Brief User $jwt joins an existing channel with the provided name
   * @param jwt authorization token
   * @return 201 - channel_id
   */
  @Post('/channels/:channel_id/join')
  JoinChannel(@Headers('authorization') jwt, @Param('channel_id') channel_id) {
    this.logger.log(
      `POST '/channels/:channel_id/join' from ${jwt}: chat_name => ${channel_id}`,
    );
  }

  /**
   *
   * @Brief User $jwt leaves an subscribed channel with the provided name
   * @param jwt authorization token
   * @return 200
   */
  @Delete('/channels/:channel_id/join')
  LeaveChannel(@Headers('authorization') jwt, @Param('channel_id') channel_id) {
    this.logger.log(
      `DELETE '/channels/:channel_id/join' from ${jwt}: channel_id => ${channel_id}`,
    );
  }
}
