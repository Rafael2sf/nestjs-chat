import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let chatController: ChatController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [ChatService],
    }).compile();

    chatController = app.get<ChatController>(ChatController);
  });

  describe('chat', () => {
    let channel_id: string = undefined;

    it('it should be defined', () => {
      expect(chatController).toBeDefined();
    });

    it('create channel', () => {
      channel_id = chatController.OnChannelCreate({
        user_id: 'John Doe',
        name: 'test',
      });
      expect(channel_id).toHaveLength(36);
    });

    it('get channel', () => {
      expect(chatController.getChannels()).toEqual({
        channel_id,
        owner: 'John Doe',
        name: 'test',
      });
    });
  });
});
