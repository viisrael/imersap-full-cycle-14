'use client';

import type { FindPlaceFromTextResponseData } from "@googlemaps/google-maps-services-js";
import { Loader } from "@googlemaps/js-api-loader";
import { FormEvent, useEffect } from "react";

export function NewRoutePage() {

  useEffect(() =>{
    (async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: ['routes', 'geometry']
      });
  
      
      await Promise.all([
        loader.importLibrary('routes'),
        loader.importLibrary('geometry')
      ]);
  
      new google.maps.Map(document.getElementById("map") as any, {
        zoom: 15,
        center: { lat: -5.1952044, lng:-37.350665 }
      });
    })();
    
  }, []);


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

    const directionData = await directionsResponse.json();

    console.log(directionData);
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
      </div>

      <div id="map" style={{height: "100%", width: "100%"}}>

      </div>
    </div>
  );
}

export default NewRoutePage;