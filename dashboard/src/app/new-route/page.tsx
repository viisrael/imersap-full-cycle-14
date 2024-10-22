'use client';

import type { DirectionsResponseData, FindPlaceFromTextResponseData } from "@googlemaps/google-maps-services-js";
import { FormEvent, useRef, useState } from "react";
import { useMap } from "../hooks/useMap";

export function NewRoutePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);
  const [directionsData, setDirectionsData] = useState<DirectionsResponseData & { request: any }>();


  async function searchPlaces(event: FormEvent) {
    event.preventDefault();

    const source = (document.getElementById("source") as HTMLInputElement).value;
    const destination = (document.getElementById("destination") as HTMLInputElement).value;

    const [sourceResponse, destinationResponse] = await Promise.all([
                                                    fetch(`http://localhost:3000/places?text=${source}`),
                                                    fetch(`http://localhost:3000/places?text=${destination}`),
                                                  ]);

    const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] = await Promise.all([
      sourceResponse.json(),
      destinationResponse.json(),
    ]);

    if(sourcePlace.status !== 'OK'){
      console.error(sourcePlace);
      alert('Não foi possível encontrar a Origem');

      return;
    }

    
    if(destinationPlace.status !== 'OK'){
      console.error(destinationPlace);
      alert('Não foi possível encontrar o Destino');

      return;
    }

    const placesSourceId = sourcePlace.candidates[0].place_id;
    const placesDestinationId = destinationPlace.candidates[0].place_id;

    const directionsResponse = await fetch(`http://localhost:3000/directions?originId=${placesSourceId}&destinationId=${placesDestinationId}`);

    const directionsData: DirectionsResponseData & { request: any } = await directionsResponse.json();

    setDirectionsData(directionsData);
    map?.removeAllRoutes();

    await map?.addRouteWithIcons({
      routeId: '1',
      startMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: directionsData.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
    });
  }

  async function createRoute(){

    const startAddres = directionsData!.routes[0].legs[0].start_address;
    const endAddres = directionsData!.routes[0].legs[0].end_address;

    const response = await fetch('http://localhost:3000/routes',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${startAddres} - ${endAddres}`,
        source_id: directionsData!.request.origin.place_id,
        destination_id: directionsData!.request.destination.place_id
      })
    });

    const route = await response.json();
  }

  return (
    <div style={{display:"flex", flexDirection:"row", height: "100%", width: "100%"}}>
      <div>
        <h1>
          Nova Rota
        </h1>
        <form style={{display: 'flex', flexDirection: 'column'}} onSubmit={searchPlaces}>
          <div>
            <input id="source" type="text" placeholder="origem" />
          </div>
          <div>
            <input id="destination" type="text" placeholder="destino" />
          </div>

          <button type="submit">Pesquisar</button>
        </form>
        { directionsData && (
          <ul>
            <li>Origem {directionsData.routes[0].legs[0].start_address}</li>
            <li>Destino {directionsData.routes[0].legs[0].end_address}</li>
            <li>
              <button onClick={createRoute}>Criar Rota</button>
            </li>
          </ul>
        ) }
      </div>

      <div id="map" 
          style={{height: "100%", width: "100%"}}
          ref={mapContainerRef} >

      </div>
    </div>
  );
}

export default NewRoutePage;