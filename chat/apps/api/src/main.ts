import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';

/* Flow

	API-GATEWAY													MICROSERVICE
<--> Controller <---------> service <=========(TCP)==========> controller <-------------. service <<-------->> database

Get Request				main logic							receive request					inner logic
Validate Data			cretate necessary json-req			no validation required			do databse queries
         				normalize errors					throw errors

ex:
	POST /channels/		
	validate name

*/

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
