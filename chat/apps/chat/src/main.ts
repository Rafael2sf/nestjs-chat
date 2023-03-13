import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ChatModule } from './chat.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ChatModule,
    {
      transport: Transport.TCP,
      options: {
        // required for docker
        host: 'chat',
        port: 3001,
      },
    },
  );
  await app.listen();
}
bootstrap();
