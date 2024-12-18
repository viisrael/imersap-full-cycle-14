import { Inject, Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
import { DirectionsService } from 'src/maps/directions/directions.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class RoutesService {
  constructor(
    private prismaService: PrismaService,
    private directionsService: DirectionsService,
    //@Inject('KAFKA_SERVICE') private kafkaService: ClientKafka,
    @InjectQueue('kafka-producer') private kafkaProducerQueue: Queue,
  ) {}

  async create(createRouteDto: CreateRouteDto) {
    const { available_travel_modes, geocoded_waypoints, routes, request } =
      await this.directionsService.getDirections(
        createRouteDto.source_id,
        createRouteDto.destination_id,
      );

    const legs = routes[0].legs[0];
    const routeCreated = await this.prismaService.routes.create({
      data: {
        name: createRouteDto.name,
        source: {
          name: legs.start_address,
          location: {
            lat: legs.start_location.lat,
            lng: legs.start_location.lng,
          },
        },
        destination: {
          name: legs.end_address,
          location: {
            lat: legs.end_location.lat,
            lng: legs.end_location.lng,
          },
        },
        distance: legs.distance.value,
        duration: legs.duration.value,
        directions: JSON.stringify({
          available_travel_modes,
          geocoded_waypoints,
          routes,
          request,
        }),
      },
    });

    await this.kafkaProducerQueue.add({
      event: 'RouteCreated',
      id: routeCreated.id,
      distance: routeCreated.distance,
      name: routeCreated.name,
    });

    //await this.kafkaService.emit('route', {
    //  event: 'RouteCreated',
    //  id: routeCreated.id,
    //  distance: routeCreated.distance,
    //});

    return routeCreated;
  }

  findAll() {
    return this.prismaService.routes.findMany();
  }

  async findOne(id: string) {
    return this.prismaService.routes.findUniqueOrThrow({
      where: { id },
    });
  }

  update(id: number, updateRouteDto: UpdateRouteDto) {
    return `This action updates a #${id} route`;
  }

  remove(id: number) {
    return `This action removes a #${id} route`;
  }
}
