import {
  directions,
  DirectionsResponse,
  DirectionsResponseData,
} from '@googlemaps/google-maps-services-js/dist/directions';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Queue } from 'bull';
import { eventNames } from 'process';
import { Counter } from 'prom-client';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
import { finished } from 'stream';

@Injectable()
export class RoutesDriverService {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue('kafka-producer') private kafkaProducerQueue: Queue,
    @InjectMetric('route_started_counter') private routeStartedCounter: Counter,
    @InjectMetric('route_finished_counter')
    private routeFinishedCounter: Counter,
  ) {}

  async createOrUpdate(dto: { route_id: string; lat: number; lng: number }) {
    const countDriver = await this.prismaService.routeDriver.count({
      where: {
        route_id: dto.route_id,
      },
    });

    const routeDriver = await this.prismaService.routeDriver.upsert({
      include: {
        route: true,
      },
      where: {
        route_id: dto.route_id,
      },
      create: {
        route_id: dto.route_id,
        points: {
          set: {
            location: {
              lat: dto.lat,
              lng: dto.lng,
            },
          },
        },
      },
      update: {
        points: {
          push: {
            location: {
              lat: dto.lat,
              lng: dto.lng,
            },
          },
        },
      },
    });

    if (countDriver === 0) {
      this.routeStartedCounter.inc();
      await this.kafkaProducerQueue.add({
        event: 'RouteStarter',
        name: routeDriver.route.name,
        started_at: new Date().toISOString(),
        lat: dto.lat,
        lng: dto.lng,
      });

      return routeDriver;
    }

    const directions: DirectionsResponseData = JSON.parse(
      routeDriver.route.directions as string,
    );
    const lastPoint =
      directions.routes[0].legs[0].steps[
        directions.routes[0].legs[0].steps.length - 1
      ];

    if (
      lastPoint.end_location.lat === dto.lat &&
      lastPoint.end_location.lng === dto.lng
    ) {
      this.routeFinishedCounter.inc();
      await this.kafkaProducerQueue.add({
        event: 'RouteFinished',
        name: routeDriver.route.name,
        finished_at: new Date().toISOString(),
        lat: dto.lat,
        lng: dto.lng,
      });

      return routeDriver;
    }

    await this.kafkaProducerQueue.add({
      event: 'DriverMoved',
      id: routeDriver.route_id,
      name: routeDriver.route.name,
      lat: dto.lat,
      lng: dto.lng,
    });

    return routeDriver;
  }
}
