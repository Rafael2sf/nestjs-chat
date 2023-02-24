import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Logger,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { Response } from 'express';

@Controller('/')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  private readonly logger = new Logger(ChatController.name);

  /**
   * @TODO validate jwt -> get user ->
   * @TODO validate @ Param decorators
   * */

  /**
   * @Brief Return all channels visible to User $jwt
   * @param jwt authorization token
   * return 200 - [ channel ...]
   */
  @Get('/channels/')
  getChannels(@Headers('authorization') jwt, @Res() res: Response) {
    this.logger.log(`GET '/channels/' from ${jwt}`);
    this.chatService
      .getChannels()
      .then((value) => {
        res.json(value).send();
      })
      .catch((e) => {
        if (!e.statusCode) res.status(500).send();
        else res.status(e.statusCode).json(e.message).send();
      });
  }

  /**
   *
   * @Brief User $jwt creates a channel with the provided name
   * @param jwt authorization token
   * @param name provide the channel name in body as json
   * @return channel_id
   */
  @Post('/channels/')
  createChannel(
    @Headers('authorization') jwt,
    @Body() body: CreateChannelDto,
    @Res() res: Response,
  ) {
    this.logger.log(`POST '/channels/' from ${jwt}: chat_name => ${body.name}`);
    this.chatService
      .createChannel(jwt.split(' ')[1], body.name)
      .then((value) => {
        res.json({ channel_id: value }).send();
      })
      .catch((e) => {
        if (!e.statusCode) res.status(500).send();
        else res.status(e.statusCode).json(e.message).send();
      });
  }

  /**
   *
   * @Brief User $jwt joins an existing channel with the provided name
   * @param jwt authorization token
   * @return 201 - channel_id
   */
  @Post('/channels/:channel_id/join')
  joinChannel(
    @Headers('authorization') jwt,
    @Param('channel_id') channel_id: string,
    @Res() res: Response,
  ) {
    this.logger.log(
      `POST '/channels/:channel_id/join' from ${jwt}: chat_name => ${channel_id}`,
    );
    return this.chatService
      .joinChannel(jwt.split(' ')[1], channel_id)
      .then((_) => res.json().send)
      .catch((e) => {
        if (!e.statusCode) res.status(500).send();
        else res.status(e.statusCode).json(e.message).send();
      });
  }

  /**
   *
   * @Brief User $jwt leaves an subscribed channel with the provided name
   * @param jwt authorization token
   * @return 200
   */
  @Delete('/channels/:channel_id/join')
  leaveChannel(@Headers('authorization') jwt, @Param('channel_id') channel_id) {
    this.logger.log(
      `DELETE '/channels/:channel_id/join' from ${jwt}: channel_id => ${channel_id}`,
    );
  }
}
