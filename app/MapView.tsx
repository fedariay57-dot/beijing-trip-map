"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { ComponentType, PropsWithChildren } from "react";

const beijingCenter: LatLngExpression = [39.9042, 116.4074];

type MapContainerFixedProps = PropsWithChildren<{
  center: LatLngExpression;
  zoom: number;
  scrollWheelZoom: boolean;
  className: string;
}>;

const MapContainerFixed =
  MapContainer as ComponentType<MapContainerFixedProps>;

export default function MapView() {
  return (
    <div className="map-container">
      <MapContainerFixed
        center={beijingCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainerFixed>
    </div>
  );
}
