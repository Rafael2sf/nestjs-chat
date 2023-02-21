import { Controller, Get } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('/')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('test')
  test() {
    this.apiService.test();
  }
}
