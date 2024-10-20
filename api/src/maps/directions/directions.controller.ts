import { Controller, Get, Query } from '@nestjs/common';
import { DirectionsService } from './directions.service';

@Controller('directions')
export class DirectionsController {

  constructor(private readonly direciontsSerivce: DirectionsService){}


  @Get()
  async getDirecions(@Query('originId') originId: string,
                     @Query('destinationId') destinationId: string){

        console.log(originId, destinationId)
        return this.direciontsSerivce.getDirections(originId, destinationId);
  }
}
