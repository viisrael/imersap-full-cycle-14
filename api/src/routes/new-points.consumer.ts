import { Job } from 'bull';
import { RoutesDriverService } from './routes-driver/routes-driver.service';
import { Process, Processor } from '@nestjs/bull';

@Processor('new-points') //same name at RouteModules
export class NewPointsConsumer {
  constructor(private readonly routesDriverService: RoutesDriverService) {}

  @Process()
  async handle(job: Job<{ route_id: string; lat: number; lng: number }>) {
    await this.routesDriverService.createOrUpdate(job.data);

    return {};
  }
}
