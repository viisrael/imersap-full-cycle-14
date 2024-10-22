import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DirectionsService } from './directions.service';

@Controller('directions')
export class DirectionsController {
  constructor(private readonly direciontsSerivce: DirectionsService) {}

  @Get()
  async getDirecions(
    @Query('originId') originId: string,
    @Query('destinationId') destinationId: string,
  ) {
    if (!originId || !destinationId)
      throw new BadRequestException('Erro origem ou destino inválido');

    return this.direciontsSerivce.getDirections(originId, destinationId);
  }
}
