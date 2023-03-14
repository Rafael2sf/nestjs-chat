import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ChatClientService } from './chat-client.service';
import { CreateChannelDto } from './dto/CreateChannel.dto';
import { Response } from 'express';
import { ChatClientGateway } from './chat-client.gateway';

function AsyncResponse<T>(
  res: Response,
  onFullFilled: Promise<T>,
  sucess = null,
  error = null,
): void {
  onFullFilled
    .then((data) => {
      if (sucess) sucess(data, res);
      else res.json(data);
    })
    .catch((e) => {
      if (!e.statusCode)
        res.status(503).json({ message: 'Service unavailable' });
      else if (error) error(e, res);
      else
        res.status(e.statusCode).json({ message: e.message, error: e.error });
    });
}

@Controller('/')
export class ChatClientController {
  constructor(
    private readonly chatService: ChatClientService,
    private readonly chatGateway: ChatClientGateway,
  ) {}
  private readonly logger = new Logger(ChatClientController.name);

  @Get()
  async test_anything() {
    this.chatGateway.server.emit('test', 'nice ...');
  }

  /**
   * @Brief Return all channels visible to User $jwt
   * @param jwt authorization token
   * return 200 - [ channel ...]
   */
  @Get('/channels/')
  getChannels(@Headers('authorization') jwt: string, @Res() res: Response) {
    this.logger.log(`GET /channels/ jwt=${jwt}`);
    AsyncResponse(res, this.chatService.getChannels());
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
    @Headers('authorization') jwt: string,
    @Body() body: CreateChannelDto,
    @Res() res: Response,
  ) {
    this.logger.log(`POST /channels/ jwt=${jwt}: name=${body.name}`);
    AsyncResponse(
      res,
      this.chatService.createChannel(jwt.split(' ')[1], body.name, body.type),
    );
  }

  /**
   * @Brief User $jwt deletes an owned channel
   * @param jwt authorization token
   * @param channel_id channel unique identifier
   * @return 200
   */
  @Delete('/channels/:channel_id/')
  deleteChannel(
    @Headers('authorization') jwt: string,
    @Param('channel_id') channel_id: string,
    @Res() res: Response,
  ) {
    this.logger.log(`DELETE /channels/${channel_id}/ jwt=${jwt}`);
    AsyncResponse(
      res,
      this.chatService.deleteChannel(jwt.split(' ')[1], channel_id),
    );
  }

  /**
   *
   * @param jwt
   * @param channel_id
   * @param limit
   * @param offset
   */
  @Get('/channels/:channel_id/')
  getChannel(
    @Headers('authorization') jwt: string,
    @Param('channel_id') channel_id: string,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /channels/${channel_id}/ jwt=${jwt}`);
    AsyncResponse(
      res,
      this.chatService.getChannel({
        user_id: jwt.split(' ')[1],
        channel_id,
        limit,
        offset,
      }),
    );
  }

  /**
   * @Brief User $jwt retrieves all messages from an existng channel
   * @param jwt authorization token
   * @return 200
   **/
  @Get('/channels/:channel_id/history')
  getChannelMessages(
    @Headers('authorization') jwt: string,
    @Param('channel_id') channel_id: string,
    @Query('limit', new DefaultValuePipe(0), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /channels/${channel_id}/history jwt=${jwt}`);
    AsyncResponse(
      res,
      this.chatService.getMessages({
        user_id: jwt.split(' ')[1],
        channel_id,
        limit,
        offset,
      }),
    );
  }

  /**
   *
   * @Brief User $jwt joins an existing channel
   * @param jwt authorization token
   * @return 201 - channel_id
   */
  @Post('/channels/:channel_id/join')
  joinChannel(
    @Headers('authorization') jwt: string,
    @Param('channel_id') channel_id: string,
    @Res() res: Response,
  ) {
    this.logger.log(`POST /channels/${channel_id}/join jwt=${jwt}`);
    AsyncResponse(
      res,
      this.chatService.joinChannel(jwt.split(' ')[1], channel_id),
    );
  }

  /**
   *
   * @Brief User $jwt leaves an subscribed channel with the provided name
   * @param jwt authorization token
   * @return 200
   */
  @Delete('/channels/:channel_id/join')
  leaveChannel(
    @Headers('authorization') jwt: string,
    @Param('channel_id') channel_id: string,
    @Res() res: Response,
  ) {
    this.logger.log(`DELETE /channels/${channel_id}/join jwt=${jwt}`);
    AsyncResponse(
      res,
      this.chatService.leaveChannel(jwt.split(' ')[1], channel_id),
      (is_owner: boolean) => {
        if (is_owner) this.chatGateway.forceRoomDestroy(channel_id);
        else this.chatGateway.forceRoomLeave(jwt.split(' ')[1], channel_id);
        res.send();
      },
    );
  }

  /**
   * @Brief User $jwt mutes an user in a $channel_id for x minutes
   * @param jwt authorization token
   * @param username target user to mute
   * @query minutes mute length
   * @return 201
   */
  @Post('/channels/:channel_id/mute/:username')
  muteUser(
    @Headers('authorization') jwt: string,
    @Param('channel_id') channel_id: string,
    @Param('username') username: string,
    @Query('minutes', ParseIntPipe) timestamp: number,
    @Res() res: Response,
  ) {
    this.logger.log(
      `POST /channels/${channel_id}/mute/${username} jwt=${jwt} minutes=${timestamp}`,
    );
    AsyncResponse(
      res,
      this.chatService.muteUser({
        user_id: jwt.split(' ')[1],
        channel_id,
        target_id: username,
        timestamp,
      }),
    );
  }

  /**
   * @Brief User $jwt unmutes $username in  $channel_id
   * @param jwt authorization token
   * @param username target user to unmute
   * @return 200
   */
  @Delete('/channels/:channel_id/mute/:username')
  unmuteUser(
    @Headers('authorization') jwt: string,
    @Param('channel_id') channel_id: string,
    @Param('username') username: string,
    @Res() res: Response,
  ) {
    this.logger.log(
      `DELETE /channels/${channel_id}/mute/${username} jwt=${jwt}`,
    );
    AsyncResponse(
      res,
      this.chatService.unmuteUser({
        user_id: jwt.split(' ')[1],
        channel_id,
        target_id: username,
      }),
    );
  }
}
