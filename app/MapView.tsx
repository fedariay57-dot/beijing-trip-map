"use client";

import { MapContainer, TileLayer } from "react-leaflet";

export default function MapView() {
  return (
    <div className="map-container">
      <MapContainer
        center={[39.9042, 116.4074]}
        zoom={11}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}