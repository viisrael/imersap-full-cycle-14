import { Client as GoogleMapsClient, PlaceInputType} from '@googlemaps/google-maps-services-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PlacesService {

  constructor(private readonly googleMapsCliente: GoogleMapsClient,
              private readonly configService: ConfigService){ }


  async findPlaces(text: string){

    console.log(this.configService.get<string>('GOOGLE_MAPS_API_KEY'));
    const { data } = await this.googleMapsCliente.findPlaceFromText({
      params: {
        input: text,
        inputtype: PlaceInputType.textQuery,
        fields: ['place_id', 'formatted_address', 'geometry', 'name'],
        key: this.configService.get<string>('GOOGLE_MAPS_API_KEY')
      } 
    });

    return data;
  }
}
