"use client";
import { NativeSelect, NativeSelectProps } from "@mui/material";
import useSWR from "swr";
import { fetcher } from "../utils/http";
import { Route } from "../utils/models";

export type RouteSelectProps = NativeSelectProps & {
  onChange?: (place_id: string) => void;
};

export function RouteSelect(props: RouteSelectProps) {
  const {
    data: routes,
    error,
    isLoading,
  } = useSWR<Route[]>(
    `http://localhost:3001/api/routes`,
    fetcher,
    {
      fallbackData: [],
    }
  );

  return (
    <NativeSelect
      {...props}
      onChange={(event) => props.onChange && props.onChange(event.target.value)}
    >
      {isLoading && <option value="">Loading...</option>}
      {routes && (
        <>
          <option value="">Select a route</option>
          {routes!.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </>
      )}
    </NativeSelect>
  );
}