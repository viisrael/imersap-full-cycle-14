'use client';

import type { DirectionsResponseData, FindPlaceFromTextResponseData } from "@googlemaps/google-maps-services-js";
import { FormEvent, useRef, useState } from "react";
import { useMap } from "../hooks/useMap";
import {Alert, Button, Card, CardActions, CardContent, Grid2, List, ListItem, ListItemText, Snackbar, TextField, Typography}  from "@mui/material";


export function NewRoutePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);
  const [directionsData, setDirectionsData] = useState<DirectionsResponseData & { request: any }>();
  const [open, setOpen] = useState(false);

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

    setOpen(true);
  }

  return (
    <Grid2 container sx={{display: "flex", flex: 1}}>
      <Grid2 size={{xs:4}} px={2}>
        <Typography variant="h4">
          Nova Rota
        </Typography>
        <form onSubmit={searchPlaces}>
          <TextField id="source" label="Origem" fullWidth sx={{mt:1}}/>
          <TextField id="destination" label="Destino" fullWidth sx={{mt:1}}/>

          <Button variant="contained" type="submit" fullWidth sx={{mt:1}}>Pesquisar</Button>
        </form>
        { directionsData && (
          <Card sx={{ mt: 1 }}>
          <CardContent>
            <List>
              <ListItem>
                <ListItemText
                  primary={"Origem"}
                  secondary={
                    directionsData?.routes[0]!.legs[0]!.start_address
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={"Destino"}
                  secondary={
                    directionsData?.routes[0]!.legs[0]!.end_address
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={"Distância"}
                  secondary={
                    directionsData?.routes[0]!.legs[0]!.distance.text
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={"Duração"}
                  secondary={
                    directionsData?.routes[0]!.legs[0]!.duration.text
                  }
                />
              </ListItem>
            </List>
          </CardContent>
          <CardActions sx={{ display: "flex", justifyContent: "center" }}>
            <Button type="button" variant="contained" onClick={createRoute}>
              Adicionar rota
            </Button>
          </CardActions>
        </Card>
        ) }
      </Grid2>

      <Grid2 id="map" 
          size={{ xs:8 }}
          ref={mapContainerRef} >

      </Grid2>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          Rota Cadastrada com Sucesso!
        </Alert>

      </Snackbar>
    </Grid2>
  );
}

export default NewRoutePage;