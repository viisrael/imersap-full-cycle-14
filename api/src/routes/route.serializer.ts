import { DirectionsResponseData } from '@googlemaps/google-maps-services-js';
import { Routes } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

export class RouteSerializer implements Omit<Routes, 'directions'> {
  name: string;
  id: string;
  distance: number;
  duration: number;
  created_at: Date;
  updated_at: Date;
  source: { name: string; location: { lat: number; lng: number } };
  destination: { name: string; location: { lat: number; lng: number } };
  directions: DirectionsResponseData & { request: any };

  constructor(route: Routes) {
    this.name = route.name;
    this.id = route.id;
    this.distance = route.distance;
    this.duration = route.duration;
    this.created_at = route.created_at;
    this.updated_at = route.updated_at;
    this.source = route.source;
    this.destination = route.destination;
    this.directions = JSON.parse(route.directions as string);
  }
}
