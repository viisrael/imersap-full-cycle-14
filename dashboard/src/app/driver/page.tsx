'use client';

import { useEffect, useRef } from "react";
import { useMap } from "../hooks/useMap";
import { Route } from "../utils/models";
import { socket } from "../utils/socket-io";
import { Button, Grid2, Typography } from "@mui/material";
import { RouteSelect } from "../components/RouteSelect";

export function DriverPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    }
  }, []);

  async function startRoute(){
    const routeId = (document.getElementById('route') as HTMLSelectElement).value;
    const response = await fetch(`http://localhost:3001/api/routes/${routeId}`);
    const route: Route = await response.json();

    map?.removeAllRoutes();

    await map?.addRouteWithIcons({
      routeId: routeId,
      startMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: route.directions.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
    });

    const {steps} = route.directions.routes[0].legs[0];

    for(const step of steps){
      await sleep(2000);
      map?.moveCar(routeId, step.start_location);

      socket.emit('new-points', {
        route_id: routeId,
        lat: step.start_location.lat,
        lng: step.start_location.lng
      });

      await sleep(2000);
      map?.moveCar(routeId, step.end_location);
      socket.emit('new-points', {
        route_id: routeId,
        lat: step.end_location.lat,
        lng: step.end_location.lng
      });
    }
  }

  return (
    <Grid2 container sx={{display: "flex", flex: 1}}>
      <Grid2 size={{xs:4}} px={2}>
      <Typography variant="h4">
          Minha Viagem 
        </Typography>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <RouteSelect id="route" />
          <Button onClick={startRoute} variant="contained" fullWidth>Iniciar a Viagem</Button>
        </div>
      </Grid2>

      <Grid2 id="map" 
          size={{xs:8}}        
          ref={mapContainerRef} >

      </Grid2>
    </Grid2>
  );
}

export default DriverPage;

const sleep = (ms: number) => new Promise((resolve)=> setTimeout(resolve, ms));