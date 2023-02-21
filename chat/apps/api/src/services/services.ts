import { ClientProviderOptions } from '@nestjs/microservices';

export const ChatClient: ClientProviderOptions = {
  name: 'CHAT_SERVICE',
  options: {
    port: 3001,
  },
};
