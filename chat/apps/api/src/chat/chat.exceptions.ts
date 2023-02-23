import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';

@Catch(HttpException)
export class ChatExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // //const status = exception.getStatus();
    // console.log(' how to get here ... ');
    // response.status(status).json({
    //   statusCode: status,
    //   timestamp: new Date().toISOString(),
    //   path: request.url,
    // });
    console.log('got rcp exception ... ', request);
    return throwError(() => exception.getError());
  }
}
