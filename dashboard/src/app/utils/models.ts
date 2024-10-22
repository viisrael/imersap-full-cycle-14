import { DirectionsResponseData } from "@googlemaps/google-maps-services-js";


export type Route = {
  name: string;
  id: string;
  distance: number;
  duration: number;
  created_at: Date;
  updated_at: Date;
  source: { name: string; location: { lat: number; lng: number } };
  destination: { name: string; location: { lat: number; lng: number } };
  directions: DirectionsResponseData & { request: any };
}